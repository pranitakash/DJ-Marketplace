import { NextFunction, Request, Response } from "express";
import { db } from "../config/firebase.js";
import { messaging } from "firebase-admin";

export const requireRole = (role: "user" | "dj") => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const uid = (req as any).user.uid;

            const userDoc = await db.collection("users").doc(uid).get();

            if(!userDoc){
                return res.status(404).json({message: "User not found"})
            }

            const userData = userDoc.data();

            if(userData?.role !== role){
                return res.status(403).json({ message: "Access denied"})
            }

            next()
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: "Role verification failed"})
        }
    }
}