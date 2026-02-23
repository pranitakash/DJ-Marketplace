import { db } from "../config/firebase.js"
import { Request, Response } from "express"
import { getIO } from "../socket.js";
import { Timestamp } from "firebase-admin/firestore";

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const io = getIO();
        const [usersSnap, djsSnap, bookingsSnap] = await Promise.all([
            db.collection("users").get(),
            db.collection("djs").get(),
            db.collection("bookings").get()
        ])

        const recentBookingsSnap = await db
            .collection("bookings")
            .orderBy("createdAt", "desc")
            .limit(5)
            .get()

        const recentBookings = recentBookingsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        let totalRevenue = 0
        bookingsSnap.forEach(doc => {
            const data = doc.data()
            if (data.status === "completed") {
                totalRevenue += data.totalAmount || 0
            }
        })

        const platformEarnings = totalRevenue * 0.10 || 0
        const djEarnings = totalRevenue - platformEarnings

        const stats = {
            totalUsers: usersSnap.size,
            totalDjs: djsSnap.size,
            totalBookings: bookingsSnap.size,
            pendingBookings: bookingsSnap.docs.filter(doc => doc.data().status === "pending").length,
            completedBookings: bookingsSnap.docs.filter(doc => doc.data().status === "completed").length,
            cancelledBookings: bookingsSnap.docs.filter(doc => doc.data().status === "cancelled").length,
            totalRevenue,
            recentBookings,
            platformEarnings,
            djEarnings
        }

        io.to("admin_room").emit("revenue_update", {
            totalRevenue,
            recentBookings,
        });
        return res.status(200).json({ stats })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getAllBookings = async (req: Request, res: Response) => {
    try {
        const bookingsSnap = await db.collection("bookings").get()

        if (bookingsSnap.empty) {
            return res.status(404).json({ message: "No bookings found" })
        }
        const bookings = bookingsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        return res.status(200).json({ bookings })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }

}

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const usersSnap = await db.collection("users").get()

        if (usersSnap.empty) {
            return res.status(404).json({ message: "No users found" })
        }
        const users = usersSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        return res.status(200).json({ users })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const getAllDjs = async (req: Request, res: Response) => {
    try {
        const djsSnap = await db.collection("djs").get()

        if (djsSnap.empty) {
            return res.status(404).json({ message: "No djs found" })
        }
        const djs = djsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        return res.status(200).json({ djs })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const blockDjs = async (req: Request, res: Response) => {
    try {
        const io = getIO();
        const { djId } = req.params as { djId: string }
        const djDoc = await db.collection("djs").doc(djId).get()

        if (!djDoc.exists) {
            return res.status(404).json({ message: "Dj not found" })
        }

        const djData = djDoc.data()

        if (djData?.isBlocked === true) {
            return res.status(400).json({ message: "Dj is already blocked" })
        }

        await djDoc.ref.update({ isBlocked: true, blockedAt: Timestamp.now() })

        io.to(`dj_${djId}`).emit("dj_blocked", {
            djId,
            isBlocked: true,
        });

        return res.status(200).json({ message: "Dj blocked successfully" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const unblockDjs = async (req: Request, res: Response) => {
    try {
        const io = getIO();
        const { djId } = req.params as { djId: string }
        const djDoc = await db.collection("djs").doc(djId).get()

        if (!djDoc.exists) {
            return res.status(404).json({ message: "Dj not found" })
        }

        const djData = djDoc.data()

        if (djData?.isBlocked === false) {
            return res.status(400).json({ message: "Dj is not blocked" })
        }

        await djDoc.ref.update({ isBlocked: false, unblockedAt: Timestamp.now() })

        io.to(`dj_${djId}`).emit("dj_unblocked", {
            djId,
            isBlocked: false,
        });

        return res.status(200).json({ message: "Dj unblocked successfully" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const verifyBooking = async (req: Request, res: Response) => {
    try {
        const io = getIO();
        const { bookingId } = req.params as { bookingId: string }
        const bookingDoc = await db.collection("bookings").doc(bookingId).get()

        if (!bookingDoc.exists) {
            return res.status(404).json({ message: "Booking not found" })
        }

        const bookingData = bookingDoc.data()

        if (bookingData?.isVerified === true) {
            return res.status(400).json({ message: "Booking is already verified" })
        }

        if (bookingData?.status !== "completed") {
            return res.status(400).json({ message: "Booking is not completed" })
        }

        await bookingDoc.ref.update({
            isVerified: true, verifiedAt: new Date(),
            payoutReleased: true })
        
        io.to(`dj_${bookingData?.djId}`).emit("booking_verified", {
            bookingId,
            isVerified: true,
        });

        io.to(`user_${bookingData?.userId}`).emit("booking_verified", {
            bookingId,
            isVerified: true,
        });

        return res.status(200).json({ message: "Booking verified successfully" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}