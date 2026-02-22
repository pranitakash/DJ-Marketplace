import { Request, Response } from "express";
import { db } from "../config/firebase.js";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const booking = req.body;

    if (!booking) {
      return res.status(400).json({ message: "Booking is required" })
    }

    const docRef = await db.collection("bookings").add({
      ...booking,
      status: "pending",
      createdAt: new Date(),
    });
    if (!docRef) {
      return res.status(500).json({ message: "Error creating booking" })
    }

    res.status(201).json({
      id: docRef.id,
      message: "Booking created",
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking" });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params as { bookingId: string };
    const { status } = req.body as { status: string };

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" })
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" })
    }

    await db.collection("bookings").doc(bookingId).update({
      status,
    });

    res.json({ message: "Booking updated successfully" });
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