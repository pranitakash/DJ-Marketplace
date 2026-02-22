import express from "express";
import { createBooking, updateBookingStatus } from "../controllers/booking.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createBooking);
router.put("/:bookingId/status", verifyToken, requireRole("dj"), updateBookingStatus);

export default router;