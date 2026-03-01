import { Router } from "express";
import { createOrder } from "../controllers/payment.controller.js";
import { verifyPayment } from "../middleware/payment.middleware.js";
import { confirmBookingController } from "../controllers/confirmBooking.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// Create Razorpay order and pending booking in Firestore
router.post("/create-order", verifyToken, createOrder);

// Verify payment signature → update booking to confirmed
router.post("/verify-payment", verifyToken, verifyPayment, confirmBookingController);

export default router;
