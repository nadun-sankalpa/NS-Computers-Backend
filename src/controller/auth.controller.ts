import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  try {
    console.log('[Auth] Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.log('[Auth] Missing credentials:', { email: !!email, password: '***' });
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required",
        error: "MISSING_CREDENTIALS"
      });
    }

    try {
      // authService.authenticateUser now returns { accessToken, refreshToken, user }
      const result = await authService.authenticateUser(email, password);
      
      // If we reach here, authentication was successful
      console.log('[Auth] Login successful for user:', email);

      console.log('[Auth] Login successful for user:', email);
      
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          result: result,
          // accessToken: result.accessToken,
          // refreshToken: result.refreshToken,
          // user: result.user
        }
      });
      
    } catch (authError: any) {
      console.error('[Auth] Authentication error:', authError);
      
      // Default error response
      let errorMessage = 'Authentication failed';
      let statusCode = 401;
      let errorCode = 'AUTH_FAILED';
      
      // Handle specific error messages
      if (authError.message.includes('password') || authError.message.includes('credentials')) {
        errorMessage = 'Invalid email or password';
        errorCode = 'INVALID_CREDENTIALS';
      } else if (authError.message.includes('not found') || authError.message.includes('No password set')) {
        errorMessage = 'User not found or account not properly set up';
        errorCode = 'USER_NOT_FOUND';
      } else if (authError instanceof jwt.JsonWebTokenError) {
        errorMessage = 'Invalid token';
        errorCode = 'INVALID_TOKEN';
        statusCode = 400;
      } else if (authError.message.includes('required')) {
        errorMessage = authError.message;
        errorCode = 'VALIDATION_ERROR';
        statusCode = 400;
      }
      
      // Log the error for debugging
      console.error(`[Auth] Authentication failed: ${errorCode} - ${errorMessage}`);
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: errorCode,
        ...(process.env.NODE_ENV !== 'production' && { 
          details: authError.message,
          stack: authError.stack 
        })
      });
    }
    
  } catch (error) {
    console.error('[Auth] Unexpected login error:', error);
    
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
      error: 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && { 
        details: error instanceof Error ? error.message : 'Unknown error' 
      })
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const newTokens = await authService.refreshAccessToken(refreshToken);
    if (!newTokens) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    res.status(200).json(newTokens);
  } catch (error) {
    console.error('Refresh token error:', error);
    const message = error instanceof Error ? error.message : "Failed to refresh token";
    res.status(500).json({ message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    await authService.revokeRefreshToken(refreshToken);
    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    console.error('Logout error:', error);
    const message = error instanceof Error ? error.message : "Failed to logout";
    res.status(500).json({ message });
  }
};

export const authController = {
  login,
  refreshToken,
  logout
};
