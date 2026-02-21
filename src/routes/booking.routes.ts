import express from "express";
import { createBooking } from "../controllers/booking.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createBooking);

export default router;