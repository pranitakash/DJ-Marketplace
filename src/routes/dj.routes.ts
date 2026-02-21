import express from "express";
import { createDJ, getAllDJs } from "../controllers/dj.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createDJ);
router.get("/", getAllDJs);

export default router;