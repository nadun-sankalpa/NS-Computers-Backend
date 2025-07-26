import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the shape of our environment variables
interface EnvVars {
  // Server
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRE: string;
  
  // Security
  PASSWORD_SALT_ROUNDS: number;
  
  // CORS
  CORS_ORIGIN: string;
}

// Validate required environment variables
const requiredVars: (keyof EnvVars)[] = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CORS_ORIGIN'
];

// Check for missing required environment variables
const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Export environment variables with type safety
export const env: EnvVars = {
  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  
  // Security
  PASSWORD_SALT_ROUNDS: parseInt(process.env.PASSWORD_SALT_ROUNDS || '10', 10),
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN!,
};

// Log environment in non-production
if (env.NODE_ENV !== 'production') {
  console.log('Environment variables loaded:', {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    CORS_ORIGIN: env.CORS_ORIGIN,
    // Don't log sensitive information
  });
}
