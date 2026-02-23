import express from "express";
import { getAllBookings, getAllDjs, getAllUsers, blockDjs, getAdminStats, unblockDjs } from "../controllers/admin.controller.js";
import { requiredAdmin } from "../middleware/admin.middleware.js";

const router = express.Router()

router.get("/stats", requiredAdmin, getAdminStats)
router.get("/bookings", requiredAdmin, getAllBookings)
router.get("/users", requiredAdmin, getAllUsers)
router.get("/djs", requiredAdmin, getAllDjs)
router.put("/block/:djId", requiredAdmin, blockDjs)
router.put("/unblock/:djId", requiredAdmin, unblockDjs)

export default router