import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebase.js";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = await auth.verifyIdToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    console.log("Token Error:", error);
    return res.status(403).json({ message: "Invalid token" });
  }
};