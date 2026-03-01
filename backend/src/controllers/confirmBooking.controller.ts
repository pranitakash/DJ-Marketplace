import { Request, Response } from "express";
import { db } from "../config/firebase.js";
import { Timestamp } from "firebase-admin/firestore";
import { getIO } from "../socket.js";

/**
 * Called AFTER verifyPayment middleware confirms the Razorpay signature.
 * Creates the booking in Firestore only after payment is verified.
 */
export const confirmBookingController = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            djId,
            djName,
            userId,
            userName,
            targetDate,
            hours,
            venueLocation,
            razorpay_payment_id,
            razorpay_order_id,
        } = req.body;

        // Validate required fields
        if (!djId || !userId || !targetDate || !hours || !venueLocation) {
            return res.status(400).json({
                success: false,
                message: "Missing required booking fields",
            });
        }

        // 1. Fetch exact hourly rate from Firestore for recalculated total
        const djDoc = await db.collection("djs").doc(djId).get();
        const hourlyRate = djDoc.exists ? (djDoc.data()?.hourlyRate || 5000) : 5000;

        // Server-side recalculation — never trust frontend
        const totalAmount = Number(hours) * hourlyRate;

        const now = Timestamp.now();

        // Find the pending booking by orderId
        const bookingQuery = await db.collection("bookings")
            .where("orderId", "==", razorpay_order_id)
            .limit(1)
            .get();

        if (bookingQuery.empty) {
            return res.status(404).json({
                success: false,
                message: "Booking not found for this order",
            });
        }

        const bookingDoc = bookingQuery.docs[0];
        if (!bookingDoc) {
            return res.status(404).json({
                success: false,
                message: "Booking document not found",
            });
        }
        const bookingId = bookingDoc.id;
        const bookingData = bookingDoc.data();

        // 1. Update main booking document
        await bookingDoc.ref.update({
            status: "pending",
            paymentId: razorpay_payment_id,
            updatedAt: now,
        });

        // 2. Update reference to user's events sub-collection
        const resolvedUserId = req.user?.uid || userId;
        await db
            .collection("users")
            .doc(resolvedUserId)
            .collection("events")
            .doc(bookingId)
            .update({
                status: "pending",
            });

        // 3. Update reference to DJ's requests sub-collection
        await db
            .collection("djs")
            .doc(djId)
            .collection("requests")
            .doc(bookingId)
            .update({
                status: "pending",
            });

        // 4. Emit socket events for real-time dashboard sync
        try {
            const io = getIO();
            io.to(`user_${userId}`).emit("booking_created", {
                bookingId,
                ...bookingData,
            });
            io.to(`dj_${djId}`).emit("new_booking", {
                bookingId,
                ...bookingData,
            });
        } catch {
            // Socket emission is non-critical
        }

        res.status(201).json({
            success: true,
            message: "Booking confirmed successfully",
            bookingId,
        });
    } catch (error) {
        console.error("Error confirming booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to confirm booking",
        });
    }
};