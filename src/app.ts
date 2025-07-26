// app.ts
import express, {Express, Request, Response} from "express";

// 1. Initialize the express app
const app: Express = express();

// 2. Define a simple HTTP GET Request
app.get('/', (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.use(express.json());

// 3. Expert the app to use outside (in index.ts)
export default app;