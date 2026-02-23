import { Request, Response, NextFunction } from "express";
import { db } from "../config/firebase.js";

export const authorize = (allowedRoles: ("user" | "dj" | "admin")[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user || !user.uid) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            // 1. Check Custom Claims first (High performance)
            if (user.role && allowedRoles.includes(user.role as any)) {
                return next();
            }

            // 2. Fallback to Firestore (For legacy users/compatibility)
            const userDoc = await db.collection("users").doc(user.uid).get();
            if (!userDoc.exists) {
                return res.status(404).json({ message: "User not found" });
            }

            const userData = userDoc.data();
            const role = userData?.role;

            if (role && allowedRoles.includes(role as any)) {
                // Sync claim for next time (Optional but recommended)
                // Note: For now we just allow the request
                return next();
            }

            return res.status(403).json({ message: "Access denied: Insufficient permissions" });
        } catch (error) {
            console.error("Authorization Error:", error);
            return res.status(500).json({ message: "Internal server error during authorization" });
        }
    };
};
