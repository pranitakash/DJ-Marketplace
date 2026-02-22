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
        let query:any = db.collection("djs")

        const {loaction, minPrice, maxPrice} = req.query

        if(loaction){
            query = query.where("location", "==", loaction)
        }
        if(minPrice){
            query = query.where("priceStarting", ">=", Number(minPrice))
        }
        if(maxPrice){
            query = query.where("priceStarting", "<=", Number(maxPrice))
        }

        const snapshot = await query.get()
        const djs = snapshot.docs.map((doc:any) => ({
            id: doc.id,
            ...doc.data(),
        }))
        if(!djs){
            return res.status(404).json({message: "No DJs found"})
        }   
        res.status(200).json(djs)

     } catch (error) {
        console.log("Error fetching DJs:", error);
        res.status(500).json({ message: "Error fetching DJs" });
    }
}

export const getDJAnalytics = async(req: Request, res: Response) => {
    try {
        const uid = req.user?.uid

        if(!uid){
            return res.status(401).json({message: "Unauthorized"})
        }

        const snapshot = await db.collection("bookings").where("djId", "==", uid).get()

        if(snapshot.empty){
            return res.status(200).json({
                totalBookings: 0,
                completedBookings: 0,
                cancelledBookings: 0,
                totalRevenue: 0,
                pendingBookings: 0,
            })
        }
        let pendingBookings = 0
        let cancelledBookings = 0
        let totalBookings = 0
        let completedBookings = 0
        let totalRevenue = 0

        snapshot.forEach((doc) => {
            const booking = doc.data();
            totalBookings++

            if(booking.status === "pending"){
                pendingBookings++
            }
            if(booking.status === "cancelled"){
                cancelledBookings++
            }
            if(booking.status === "completed"){
                completedBookings++
                totalRevenue += booking.price || 0
            }
        })

        res.status(200).json({
            totalBookings,
            completedBookings,
            cancelledBookings,
            totalRevenue,
            pendingBookings,    
        })
    } catch (error) {
        console.log("Error fetching DJ analytics:", error);
        res.status(500).json({ message: "Error fetching DJ analytics" });
    }
}
