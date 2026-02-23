import express from "express";
import { getAllBookings, getAllDjs, getAllUsers, blockDjs, getAdminStats, unblockDjs } from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router()

router.get("/stats", verifyToken, authorize(["admin"]), getAdminStats)
router.get("/bookings", verifyToken, authorize(["admin"]), getAllBookings)
router.get("/users", verifyToken, authorize(["admin"]), getAllUsers)
router.get("/djs", verifyToken, authorize(["admin"]), getAllDjs)
router.put("/block/:djId", verifyToken, authorize(["admin"]), blockDjs)
router.put("/unblock/:djId", verifyToken, authorize(["admin"]), unblockDjs)

export default router