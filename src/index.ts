// index.ts
import app, { startServer } from "./app";

// Start the server with database connection
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});