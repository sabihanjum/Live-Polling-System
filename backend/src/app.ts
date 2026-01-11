import express, { Request, Response } from "express";
import cors from "cors";
import pollRoutes from "./routes/poll.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use("/api/poll", pollRoutes);

export default app;
