import { Request, Response } from "express";
import { createRazorpayOrder } from "../services/payment.service.js";
import { db } from "../config/firebase.js";
import { Timestamp } from "firebase-admin/firestore";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { djId, djName, userId, userName, targetDate, hours, venueLocation } = req.body;

        // Validate required fields
        if (!djId || !userId || !targetDate || !hours || !venueLocation) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: djId, userId, targetDate, hours, venueLocation",
            });
        }

        if (hours <= 0) {
            return res.status(400).json({
                success: false,
                message: "Hours must be a positive number",
            });
        }

        const { order, totalAmount } = await createRazorpayOrder({
            djId,
            djName: djName || "Unknown DJ",
            userId,
            userName: userName || "Unknown User",
            targetDate,
            hours: Number(hours),
            venueLocation,
        });

        // Create pending booking
        const now = Timestamp.now();
        const bookingData = {
            djId,
            djName: djName || "Unknown DJ",
            userId: req.user?.uid || userId, // Prefer user from token
            userName: userName || "Unknown User",
            targetDate,
            hours: Number(hours),
            venueLocation,
            totalAmount,
            orderId: order.id,
            status: "payment_pending",
            createdAt: now,
            updatedAt: now,
        };

        const bookingRef = await db.collection("bookings").add(bookingData);

        // Add reference to user's events sub-collection
        await db.collection("users").doc(req.user?.uid || userId).collection("events").doc(bookingRef.id).set({
            bookingRef: bookingRef.id,
            djName: bookingData.djName,
            targetDate,
            status: "pending",
            totalAmount,
            createdAt: now,
        });

        // Add reference to DJ's requests sub-collection
        await db.collection("djs").doc(djId).collection("requests").doc(bookingRef.id).set({
            bookingRef: bookingRef.id,
            userName: bookingData.userName,
            targetDate,
            status: "pending",
            totalAmount,
            createdAt: now,
        });

        res.status(200).json({
            success: true,
            order,
            totalAmount,
            bookingId: bookingRef.id,
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Failed to create payment order" });
    }
};
