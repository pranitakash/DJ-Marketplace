import express from "express";
import { createBooking, updateBookingStatus, cancelBooking, getBookings } from "../controllers/booking.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.post("/", verifyToken, createBooking);
router.get("/", verifyToken, getBookings);
router.put("/:bookingId/status", verifyToken, authorize(["dj"]), updateBookingStatus);
router.delete("/:bookingId", verifyToken, cancelBooking);

export default router;