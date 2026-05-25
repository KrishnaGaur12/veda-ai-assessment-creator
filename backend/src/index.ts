import express from "express";
import cors from "cors";
import { createServer } from "http";
import config from "./config";
import connectDB from "./config/database";
import { initWebSocket } from "./websocket/wsServer";
import { startGenerationWorker } from "./workers/generationWorker";
import { getAssignmentQueue } from "./queues/assignmentQueue";
import assignmentRoutes from "./routes/assignments";
import path from "path";

const app = express();
const server = createServer(app);

// Middleware
app.use(
  cors({
    origin: [
      config.frontendUrl,
      "http://localhost:3000",
      "https://veda-ai-assessment-creator.netlify.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/assignments", assignmentRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(`❌ Unhandled error: ${err.message}`);
    res.status(500).json({
      success: false,
      error:
        config.nodeEnv === "production"
          ? "Internal server error"
          : err.message,
    });
  }
);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize WebSocket
    initWebSocket(server);

    // Initialize BullMQ queue
    getAssignmentQueue();

    // Start BullMQ worker
    startGenerationWorker();

    // Start listening
    server.listen(config.port, () => {
      console.log(`
🚀 VedaAI Backend Server Running
📡 Port: ${config.port}
🌍 Environment: ${config.nodeEnv}
🔗 Frontend URL: ${config.frontendUrl}
🔌 WebSocket: Enabled
📋 BullMQ Worker: Active
      `);
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Failed to start server: ${err}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🔄 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🔄 SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

startServer();

export default app;
