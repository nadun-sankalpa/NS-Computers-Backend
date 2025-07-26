import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Access the secret key defined in .env file
const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expected format: "Bearer <token>"

  if (!token) {
    res.status(401).json({ error: "Auth token is not present in request headers!" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(401).json({ error: "Invalid or expired auth token provided!" });
      return;
    }

    (req as Request & { user?: any }).user = user; // Store decoded user info
    next(); // Here next is a callback function provided by express.js used to pass control to the next middleware function in the stack
  });
};