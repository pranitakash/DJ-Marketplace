import { Request, Response } from "express";
import { db, auth } from "../config/firebase.js";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, name, role, password } = req.body

    if (!email || !name || !role || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    const userRef = db.collection("users").doc(uid)

    await userRef.set({
      email,
      name,
      role,
      uid,
      createdAt: new Date(),
    })

    res.status(201).json({ message: "User registered successfully", uid })
  } catch (error: any) {
    console.log("Registration Error:", error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    res.status(500).json({ message: error.message || "Error registering user" });
  }
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey || apiKey === 'your_firebase_web_api_key_here') {
      console.error("FIREBASE_API_KEY is missing or using placeholder in .env");
      return res.status(500).json({
        message: "Login failed: Firebase API Key is not configured. Please add your Web API Key to the backend/.env file."
      });
    }

    // Use Firebase Auth REST API to sign in with email and password
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const data: any = await response.json();

    if (!response.ok) {
      return res.status(401).json({ message: data.error?.message || "Invalid email or password" });
    }

    const { localId: uid, idToken: token } = data;

    // Get user details from Firestore
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const userData = userDoc.data();

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        uid,
        ...userData,
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Error during login" });
  }
};

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