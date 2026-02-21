import { Request, Response } from "express";
import { db } from "../config/firebase.js";

export const createDJ = async(req: Request, res: Response) => {
    try {
        const data = req.body

        const docRef = await db.collection("djs").add({
            ...data, createdAt: new Date(),
        })

        res.status(201).json({message: "DJ created successfully", id: docRef.id})

    } catch (error) {
        res.status(500).json({ message: "Error creating DJ" });
    }
}

export const getAllDJs = async(req: Request, res: Response) => {
    try {
        const snapshot = await db.collection("djs").get();

        const djs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        res.status(200).json(djs)
    } catch (error) {
        console.log("Error fetching DJs:", error);
        res.status(500).json({ message: "Error fetching DJs" });
    }
}

