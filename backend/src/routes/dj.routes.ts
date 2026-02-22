import express from "express";
import { createDJ, getAllDJs, getDJAnalytics, addReview, getDJReviews } from "../controllers/dj.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createDJ);
router.get("/", getAllDJs);
router.get("/analytics", verifyToken, requireRole("dj"),getDJAnalytics);
router.post("/review", verifyToken, addReview);
router.get("/review/:djId", verifyToken, getDJReviews);

export default router;