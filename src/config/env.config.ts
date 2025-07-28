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
  
  // Email
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  SMTP_FROM: string;
  
  // Frontend
  CORS_ORIGIN: string;
}

// Validate required environment variables
const requiredVars: (keyof EnvVars)[] = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM'
];

// Validate that all required environment variables are set
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
  JWT_EXPIRE: process.env.JWT_EXPIRE || '1h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  
  // Security
  PASSWORD_SALT_ROUNDS: parseInt(process.env.PASSWORD_SALT_ROUNDS || '10', 10),
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD!,
  SMTP_FROM: process.env.SMTP_FROM!,
  
  // Frontend
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Log environment in development
if (process.env.NODE_ENV === 'development') {
  console.log('Environment variables loaded successfully');
}
