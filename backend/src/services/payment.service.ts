import { getRazorpayInstance } from "../config/razorpay.js";
import { db } from "../config/firebase.js";

export interface BookingOrderData {
    djId: string;
    djName: string;
    userId: string;
    userName: string;
    targetDate: string;
    hours: number;
    venueLocation: string;
}

/**
 * Creates a Razorpay order with server-side amount calculation.
 * Never trusts the frontend-provided amount.
 */
export const createRazorpayOrder = async (bookingData: BookingOrderData) => {
    const razorpay = getRazorpayInstance();

    // 1. Fetch exact hourly rate from Firestore for security
    const djDoc = await db.collection("djs").doc(bookingData.djId).get();
    if (!djDoc.exists) {
        throw new Error("DJ profile not found for pricing calculation.");
    }

    // Default to fallback rate if not set explicitly on profile
    const hourlyRate = djDoc.data()?.hourlyRate || 5000;

    // 2. Server-side amount calculation — security critical
    const totalAmount = bookingData.hours * hourlyRate;

    // 3. Create Razorpay order
    const order = await razorpay.orders.create({
        amount: totalAmount * 100, // Razorpay expects paise
        currency: "INR",
        notes: {
            djId: bookingData.djId,
            userId: bookingData.userId,
            hours: String(bookingData.hours),
            targetDate: bookingData.targetDate,
        },
    });

    return { order, totalAmount };
};

/**
 * Initiates a full refund for a specific Razorpay payment.
 */
export const refundRazorpayPayment = async (paymentId: string, amount: number) => {
    const razorpay = getRazorpayInstance();

    try {
        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount * 100, // Amount in paise
            speed: "normal",
            notes: {
                reason: "DJ rejected booking",
            },
        });
        return refund;
    } catch (error: any) {
        console.error("Razorpay refund error:", error);
        throw new Error(error.description || "Failed to initiate Razorpay refund");
    }
};
