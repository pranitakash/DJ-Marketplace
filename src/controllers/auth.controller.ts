import { Request, Response } from "express";
import { db } from "../config/firebase.js";
import { messaging } from "firebase-admin";

export const registerUser = async (req:Request, res: Response) => {
  try {
    const {uid, email, name, role} = (req as any).body

    if(!email || !name || !role){
      return res.status(400).json({message: "All fields are required"})
    }

    const userRef = db.collection("users").doc(uid)
    const userDoc = await userRef.get()

    if(userDoc.exists){
      return res.status(400).json({message: "User already exists"})
    }

    await userRef.set({
      email,
      name,
      role,
      createdAt: new Date(),
    })

    res.status(201).json({message: "User registered successfully"}  )
  } catch (error) {
    console.log("Registration Error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
} 

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userDoc.data();

    return res.status(200).json({
      id: userDoc.id,
      ...user,
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Error fetching user profile" });
  }
};