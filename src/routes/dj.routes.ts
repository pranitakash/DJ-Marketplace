/**
 * @openapi
 * /api/djs:
 *   get:
 *     tags:
 *       - DJs
 *     summary: Discover and filter the DJ pool
 *     description: Fetches a list of premium DJs.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of DJs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "dj_12345abc"
 *                   name:
 *                     type: string
 *                     example: "DJ Snake"
 *                   genre:
 *                     type: string
 *                     example: "EDM"
 *                   hourlyRate:
 *                     type: number
 *                     example: 500
 *       500:
 *         description: Internal server error.
 */
import express from "express";
import { createDJ, getAllDJs, getDJById, updateDJProfile, getDJAnalytics, addReview, getDJReviews } from "../controllers/dj.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.post("/", verifyToken, createDJ);
router.get("/", getAllDJs);
router.get("/analytics", verifyToken, authorize(["dj"]), getDJAnalytics);
router.get("/:id", getDJById);
router.put("/profile", verifyToken, authorize(["dj"]), updateDJProfile);
router.post("/review", verifyToken, addReview);
router.get("/review/:djId", verifyToken, getDJReviews);

export default router;