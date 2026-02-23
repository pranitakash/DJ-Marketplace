import { Request, Response } from "express";
import { db } from "../config/firebase.js";

export const createDJ = async (req: Request, res: Response) => {
    try {
        const data = req.body

        const docRef = await db.collection("djs").add({
            ...data, createdAt: new Date(),
        })

        res.status(201).json({ message: "DJ created successfully", id: docRef.id })

    } catch (error) {
        res.status(500).json({ message: "Error creating DJ" });
    }
}

export const getAllDJs = async (req: Request, res: Response) => {
    try {
        const { location, minPrice, maxPrice, limit = 10, lastDocId } = req.query as {
            location?: string;
            minPrice?: string;
            maxPrice?: string;
            limit?: string;
            lastDocId?: string;
        }

        let query: any = db.collection("djs").orderBy("createdAt", "desc").limit(Number(limit))

        if (location) {
            query = query.where("location", "==", location)
        }
        if (minPrice) {
            query = query.where("hourlyRate", ">=", Number(minPrice))
        }
        if (maxPrice) {
            query = query.where("hourlyRate", "<=", Number(maxPrice))
        }

        if (lastDocId) {
            const lastDoc = await db.collection("djs").doc(lastDocId).get()
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc)
            }
        }

        const snapshot = await query.get()
        const djs = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
        }))

        const lastVisible = snapshot.docs[snapshot.docs.length - 1];

        if (snapshot.empty) {
            return res.status(200).json({ data: [], nextCursor: null })
        }

        return res.status(200).json({ data: djs, nextCursor: lastVisible?.id || null })

    } catch (error) {
        console.log("Error fetching DJs:", error);
        return res.status(500).json({ message: "Error fetching DJs" });
    }
}

export const getDJAnalytics = async (req: Request, res: Response) => {
    try {
        const uid = req.user?.uid

        if (!uid) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const snapshot = await db.collection("bookings").where("djId", "==", uid).get()

        if (snapshot.empty) {
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

            if (booking.status === "pending") {
                pendingBookings++
            }
            if (booking.status === "cancelled") {
                cancelledBookings++
            }
            if (booking.status === "completed") {
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


export const addReview = async (req: Request, res: Response) => {
    try {
        const { djId, rating, comment } = req.body

        const userId = req.user?.uid

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        await db.collection("reviews").add({
            djId,
            userId,
            rating,
            comment,
            createdAt: new Date(),
        })

        res.status(201).json({ message: "Review added successfully" })
    } catch (error) {
        console.log("Error adding review:", error);
        res.status(500).json({ message: "Error adding review" });
    }
}

export const getDJReviews = async (req: Request, res: Response) => {
    try {
        const { djId } = req.params

        if (!djId) {
            return res.status(400).json({
                message: "Invalid DJ Id"
            })
        }

        const reviews = await db.collection("reviews").where("djId", "==", djId).get()
        if (reviews.empty) {
            return res.status(200).json({
                message: "No reviews found"
            })
        }

        const reviewData = reviews.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))

        res.status(200).json({
            reviews: reviewData,
        })
    } catch (error) {
        console.log("Error fetching reviews:", error);
        res.status(500).json({ message: "Error fetching reviews" });
    }
}