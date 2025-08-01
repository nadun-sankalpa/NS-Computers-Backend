import mongoose, { ConnectOptions } from 'mongoose';
import { config } from 'dotenv';

config();

// Define a custom error interface that includes codeName
interface MongoError extends Error {
    codeName?: string;
    code?: number | string;
}

const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ns-computers';

        // Event listeners for connection status
        mongoose.connection.on('connected', () => {
            if (mongoose.connection.db) {
                console.log(`✅ MongoDB connected to database: ${mongoose.connection.db.databaseName}`);
            } else {
                console.log('✅ MongoDB connected');
            }
        });

        mongoose.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error.message);
        });

const connectDB = async (): Promise<string> => {
    try {
        if (!DB_URI) {
            throw new Error('MongoDB connection string is not defined in environment variables');
        }
        
        // Only log the masked connection string once
        if (!process.env.DB_CONNECTION_LOGGED) {
            const maskedUri = DB_URI.replace(/:[^:]+@/, ':***@');
            console.log(`🔌 Connecting to MongoDB at ${maskedUri}...`);
            process.env.DB_CONNECTION_LOGGED = 'true';
        }

        // Connect to MongoDB with options
        const options: ConnectOptions = {
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
            retryWrites: true,
            w: 'majority'
        };

        await mongoose.connect(DB_URI, options);
        
        // Get the database instance
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Failed to get database instance');
        }
        
        try {
            // Drop the users collection to remove all indexes
            await db.collection('users').drop();
            console.log('Dropped users collection to reset all indexes');
        } catch (error: unknown) {
            const mongoError = error as MongoError;
            if (mongoError.codeName === 'NamespaceNotFound') {
                console.log('Users collection does not exist, creating a fresh one');
            } else {
                console.error('Error dropping users collection:', error);
                throw error;
            }
        }

        // Recreate the collection with the correct schema
        await db.createCollection('users');
        console.log('Created fresh users collection');

        // Rebuild indexes based on the current schema
        await mongoose.connection.syncIndexes();
        console.log('Recreated indexes based on current schema');

        return `MongoDB connected successfully to database "${db.databaseName}"`;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
