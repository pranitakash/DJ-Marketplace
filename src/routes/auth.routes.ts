import express from "express";
import { registerUser, getUserProfile } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/profile", verifyToken, getUserProfile);    

export default router;  