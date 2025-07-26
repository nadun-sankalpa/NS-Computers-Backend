import express, {Express} from "express";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import orderRoutes from "./routes/order.routes";

// Initialize the express app
const app:Express = express();

// Middlewares

// Instruct to parse the payload to JSON to be easily accessible data
app.use(express.json());

// Define application Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

export default app;