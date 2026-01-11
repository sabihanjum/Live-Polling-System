import http from "http";
import { Server } from "socket.io";
import app from "./app";
import registerPollSocket from "./sockets/poll.socket";
import { connectDatabase } from "./config/database";
import dotenv from 'dotenv';

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

registerPollSocket(io);

const PORT = process.env.PORT || 4000;

// Start server with optional database
const startServer = async () => {
  try {
    // Try to connect to database
    try {
      await connectDatabase();
      console.log('✓ MongoDB connected successfully');
    } catch (dbError) {
      console.warn('⚠ MongoDB connection failed. Running in memory-only mode.');
      console.warn('  Data will not persist across restarts.');
      console.warn('  To use database, ensure MongoDB is running on localhost:27017');
    }
    
    server.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
