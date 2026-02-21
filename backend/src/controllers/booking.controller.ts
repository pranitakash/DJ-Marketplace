import { Request, Response } from "express";
import { db } from "../config/firebase.js";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const booking = req.body;

    const docRef = await db.collection("bookings").add({
      ...booking,
      status: "pending",
      createdAt: new Date(),
    });

    res.status(201).json({
      id: docRef.id,
      message: "Booking created",
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking" });
  }
};