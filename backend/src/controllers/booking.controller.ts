import { Request, Response } from "express";
import { db } from "../config/firebase.js";
import { getIO } from "../socket.js";
import { Timestamp } from "firebase-admin/firestore";
export const createBooking = async (req: Request, res: Response) => {
  try {
    const booking = req.body;
    booking.userId = req.user?.uid;

    if (!booking || !booking.djId || !booking.userId) {
      return res.status(400).json({ message: "Booking details (djId, userId) are required" })
    }

    // Verify DJ exists
    const djDoc = await db.collection("djs").doc(booking.djId).get();
    if (!djDoc.exists) {
      return res.status(404).json({ message: "DJ not found" });
    }

    const io = getIO();

    const docRef = await db.collection("bookings").add({
      ...booking,
      eventLocation: booking.eventLocation || booking.eventLoaction, // Fallback for transition
      status: "pending",
      isVerified: false,
      createdAt: Timestamp.now(),
    });

    io.to(`dj_${booking.djId}`).emit("new_booking", {
      bookingId: docRef.id,
      ...booking,
    })

    io.to(`user_${booking.userId}`).emit("booking_created", {
      bookingId: docRef.id,
      ...booking,
    })

    res.status(201).json({
      id: docRef.id,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking" });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params as { bookingId: string };
    const { status } = req.body as { status: string };
    const io = getIO();
    const uid = req.user?.uid;

    if (!bookingId || !status) {
      return res.status(400).json({ message: "Booking ID and status are required" });
    }

    const allowedStatuses = ["confirmed", "cancelled", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bookingData = bookingDoc.data();
    if (!bookingData) return res.status(404).json({ message: "Data missing" });

    // Security: Only the assigned DJ can update status (except for specific user cancels handled elsewhere)
    if (bookingData.djId !== uid) {
      return res.status(403).json({ message: "Unauthorized: Only the assigned DJ can perform this action" });
    }

    // 1. Time Constraint Check: 5 hours before event
    const eventDate = new Date(bookingData.targetDate);
    const now = new Date();
    const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 5) {
      return res.status(400).json({
        message: "Action forbidden: Bookings cannot be modified within 5 hours of the event start time."
      });
    }

    // Prevent duplicate actions
    if (bookingData.status === status) {
      return res.status(400).json({ message: `Booking is already ${status}` });
    }

    // 2. Handle Rejection / Refund
    if (status === "cancelled" && bookingData.status === "pending") {
      if (bookingData.paymentId) {
        try {
          await refundRazorpayPayment(bookingData.paymentId, bookingData.totalAmount);
          console.log(`Refund initiated for booking ${bookingId}`);
        } catch (error: any) {
          return res.status(500).json({
            message: "Failed to process refund. Booking status not updated.",
            error: error.message
          });
        }
      }
    }

    // 3. Atomic Updates across Collections
    const updateTime = Timestamp.now();
    const batch = db.batch();

    // Update main booking
    batch.update(bookingRef, { status, updatedAt: updateTime });

    // Update user sub-collection
    const userEventRef = db.collection("users").doc(bookingData.userId).collection("events").doc(bookingId);
    batch.update(userEventRef, { status });

    // Update DJ sub-collection
    const djRequestRef = db.collection("djs").doc(bookingData.djId).collection("requests").doc(bookingId);
    batch.update(djRequestRef, { status });

    await batch.commit();

    // 4. Real-time Notifications
    const signalData = { bookingId, status };
    io.to(`dj_${bookingData.djId}`).emit("booking_updated", signalData);
    io.to(`user_${bookingData.userId}`).emit("booking_updated", signalData);

    return res.json({
      success: true,
      message: `Booking ${status} successfully`,
      refunded: status === "cancelled" && !!bookingData.paymentId
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Also import the refund service
import { refundRazorpayPayment } from "../services/payment.service.js";

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params as { bookingId: string }
    const uid = req.user?.uid

    const bookingRef = db.collection("bookings").doc(bookingId)
    const booking = await bookingRef.get()

    if (!booking.exists) {
      return res.status(404).json({ message: "Booking not found" })
    }

    const bookingData = booking.data()

    if (bookingData?.userId !== uid && bookingData?.djId !== uid) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    if (bookingData?.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" })
    }

    await bookingRef.update({
      status: "cancelled",
      cancelledAt: new Date(),
    })

    res.json({ message: "Booking cancelled successfully" })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error cancelling booking" })
  }
}