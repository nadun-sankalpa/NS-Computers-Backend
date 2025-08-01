import dotenv from 'dotenv';
import User, { IUser } from "../models/user.model"; // Assuming IUser has a 'role' property
import jwt from "jsonwebtoken";
import * as bcrypt from 'bcrypt';
import { Document } from 'mongoose';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';

// In-memory store for refresh tokens (in production, use a database)
export const refreshTokens = new Set<string>();

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: any;
}

export const authenticateUser = async (email: string, inputPassword: string) => {
  try {
    console.log('[Auth] Starting authentication for user:', email);
    
    if (!email || !inputPassword) {
      console.error('[Auth] Missing email or password');
      throw new Error('Email and password are required');
    }

    // Find user by email in the database and explicitly select the password field
    const existingUser = await User.findOne({ email }).select('+password');
    console.log("Hello", existingUser)


    if (!existingUser) {
      console.log('[Auth] User not found in database');
      throw new Error('User not found');
    }

    return {existingUser};

    // // Debug log (be careful with logging sensitive data in production)
    // console.log('[Auth] User found:', {
    //   id: existingUser._id,
    //   email: existingUser.email,
    //   hasPassword: !!existingUser.password,
    //   role: existingUser.role
    // });
    //
    // // Check if user has a password set
    // if (!existingUser.password) {
    //   console.error('[Auth] No password set for user:', existingUser.email);
    //   throw new Error('Authentication failed: No password set for user');
    // }
    //
    // // Check if password is valid
    // console.log('[Auth] Starting password comparison...');
    // const isValidPassword = await existingUser.comparePassword(inputPassword);
    //
    // if (!isValidPassword) {
    //   console.log('[Auth] Password comparison failed');
    //   throw new Error('Invalid password');
    // }
    //
    // console.log('[Auth] Password verified successfully');
    //
    // // Generate access token (short-lived)
    // const accessToken = jwt.sign(
    //     {
    //       userId: existingUser._id,
    //       email: existingUser.email,
    //       role: existingUser.role
    //     },
    //     JWT_SECRET,
    //     { expiresIn: '15m' } // Access token expires in 15 minutes
    // );
    //
    // // Generate refresh token (long-lived)
    // const refreshToken = jwt.sign(
    //   {
    //     userId: existingUser._id,
    //     email: existingUser.email,
    //     role: existingUser.role
    //   },
    //   REFRESH_SECRET,
    //   { expiresIn: '7d' } // Refresh token expires in 7 days
    // );
    //
    // console.log('[Auth] Generated refresh token');
    //
    // // Store refresh token (in-memory example)
    // refreshTokens.add(refreshToken);
    //
    // // Convert user document to plain object and remove sensitive data
    // const userObject = existingUser.toObject();
    // const { password: _, refreshToken: __, ...userData } = userObject;
    //
    // console.log('[Auth] Authentication successful for user:', userData.email);
    // console.log('[Auth] Generated access token (first 20 chars):', accessToken.substring(0, 20) + '...');
    // console.log('[Auth] Generated refresh token (first 20 chars):', refreshToken.substring(0, 20) + '...');
    //
    // return {
    //   accessToken,
    //   refreshToken,
    //   user: userData // Return the user object without sensitive data
    // };
  } catch (error) {
    console.error('Authentication error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      inputEmail: email,
      timestamp: new Date().toISOString()
    });
    throw error; // Re-throw the original error to preserve the stack trace
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    if (!refreshTokens.has(refreshToken)) {
      throw new Error('Invalid refresh token');
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as TokenPayload;

    // Find the user in the database
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Generate new access token
    const accessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '15m' }
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role
        },
        REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    // Remove old refresh token and add new one
    refreshTokens.delete(refreshToken);
    refreshTokens.add(newRefreshToken);

    // Update user's refresh token in the database (if you're storing it there)
    // user.refreshToken = newRefreshToken;
    // await user.save();

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    throw new Error('Failed to refresh token');
  }
};

export const revokeRefreshToken = async (refreshToken: string): Promise<boolean> => {
  try {
    return refreshTokens.delete(refreshToken);
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    return false;
  }
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
    }
    console.error('Token verification error:', error);
    throw new Error('Failed to verify token');
  }
};
