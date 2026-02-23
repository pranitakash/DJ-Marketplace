import { NextFunction, Request, Response } from "express";
import { db } from "../config/firebase.js";

export const requiredAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const uid = req.user?.uid

        if (!uid) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const userDoc = await db.collection('users').doc(uid).get()

        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" })
        }

        if (userDoc.data()?.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized" })
        }
        next()
    } catch (error) {
        console.error("Admin Middleware Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}