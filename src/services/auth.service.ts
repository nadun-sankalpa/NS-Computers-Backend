import dotenv from 'dotenv';
import { User } from "../model/user.model";
import { userList } from "../db/db";
import jwt from "jsonwebtoken";
import * as bcrypt from 'bcrypt';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';

// In-memory store for refresh tokens (in production, use a database)
export const refreshTokens = new Set<string>();

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  [key: string]: any;
}

export const authenticateUser = async (email: string, password: string) => {
  try {
    const existingUser = userList.find(user => user.email === email);
    if (!existingUser) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
      return null;
    }

    const accessToken = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role
      } as TokenPayload,
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: existingUser.id } as TokenPayload,
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store the refresh token
    refreshTokens.add(refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Authentication failed');
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    if (!refreshTokens.has(refreshToken)) {
      return null;
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as TokenPayload;
    if (!decoded) {
      return null;
    }

    const user = userList.find(u => u.id === decoded.userId);
    if (!user) {
      return null;
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      } as TokenPayload,
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return {
      accessToken: newAccessToken,
      refreshToken // Return the same refresh token (you might want to rotate this in production)
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw new Error('Failed to refresh token');
  }
};

export const revokeRefreshToken = async (refreshToken: string): Promise<boolean> => {
  return refreshTokens.delete(refreshToken);
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};