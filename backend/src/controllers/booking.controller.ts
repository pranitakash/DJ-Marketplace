import { Request, Response } from "express";
import { db } from "../config/firebase.js";
import { getIO } from "../socket.js";
import { Timestamp } from "firebase-admin/firestore";
export const createBooking = async (req: Request, res: Response) => {
  try {
    const booking = req.body;

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

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" })
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" })
    }

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bookingData = bookingDoc.data();

    await bookingRef.update({ status });

    io.to(`dj_${bookingData?.djId}`).emit("booking_updated", {
      bookingId,
      status,
    });

    io.to(`user_${bookingData?.userId}`).emit("booking_updated", {
      bookingId,
      status,
    });

    return res.json({ message: "Booking updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating booking" });
  }
};

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