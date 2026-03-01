import { Request, Response } from "express";
import { db } from "../config/firebase.js";

export const createDJ = async (req: Request, res: Response) => {
    try {
        const { genre, hourlyRate, bio, imageUrl, location, slug } = req.body;
        const uid = req.user?.uid;

        if (!uid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!slug || !location) {
            return res.status(400).json({ message: "Location and unique slug are required" });
        }

        // Validate slug format
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            return res.status(400).json({ message: "Slug must be lowercase alphanumeric and hyphens only" });
        }

        const result = await db.runTransaction(async (transaction) => {
            const djRef = db.collection("djs").doc(uid);
            const slugRef = db.collection("slugs").doc(slug);
            const statsRef = db.collection("metadata").doc("dj_stats");

            const djDoc = await transaction.get(djRef);
            const slugDoc = await transaction.get(slugRef);
            const statsDoc = await transaction.get(statsRef);

            // 1. Slug uniqueness and change check
            const oldSlug = djDoc.data()?.slug;
            if (slugDoc.exists && slugDoc.data()?.userId !== uid) {
                throw new Error("Slug already taken");
            }

            // If slug changed, delete the old slug registry entry
            if (oldSlug && oldSlug !== slug) {
                const oldSlugRef = db.collection("slugs").doc(oldSlug);
                transaction.delete(oldSlugRef);
            }

            let bpm = djDoc.data()?.bpm;
            let lastBpm = statsDoc.exists ? statsDoc.data()?.lastBpm : 140;

            // 2. BPM increment for new profiles
            if (!bpm) {
                bpm = lastBpm + 1;
                transaction.set(statsRef, { lastBpm: bpm }, { merge: true });
            }

            const updateData: any = {
                genre,
                hourlyRate: Number(hourlyRate),
                bio,
                imageUrl,
                location,
                slug,
                bpm,
                userId: uid,
                id: uid,
                updatedAt: new Date(),
            };

            if (!djDoc.exists) {
                updateData.createdAt = new Date();
            }

            // 3. Commit changes
            transaction.set(djRef, updateData, { merge: true });
            transaction.set(slugRef, { userId: uid, slug }, { merge: true });

            return { id: uid, ...updateData, bpm };
        });

        res.status(200).json({
            message: "DJ profile updated successfully",
            id: uid,
            data: result
        });

    } catch (error: any) {
        console.error("Error updating DJ:", error);
        const status = error.message === "Slug already taken" ? 400 : 500;
        res.status(status).json({ message: error.message || "Error updating DJ profile" });
    }
}

export const getDJProfile = async (req: Request, res: Response) => {
    try {
        const uid = req.user?.uid;

        if (!uid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const doc = await db.collection("djs").doc(uid).get();

        if (!doc.exists) {
            return res.status(404).json({ message: "DJ profile not found" });
        }

        return res.status(200).json({ data: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.log("Error fetching DJ profile:", error);
        return res.status(500).json({ message: "Error fetching DJ profile" });
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

export const getDJById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("djs").doc(id as string).get();

        if (!doc.exists) {
            return res.status(404).json({ message: "DJ not found" });
        }

        return res.status(200).json({ data: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.log("Error fetching DJ:", error);
        return res.status(500).json({ message: "Error fetching DJ" });
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