const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { StatusCodes } = require("http-status-codes");
const config = require("./config");
const connectDB = require("./config/database");
const logger = require("./utils/logger");
const postRoutes = require("./routes/post");
const scheduledPostRoutes = require("./routes/scheduledPost");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.use("/api", postRoutes);
app.use("/api/scheduled-posts", scheduledPostRoutes);

app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

app.use(errorHandler);

let server;

const startServer = async () => {
  await connectDB();

  // server = app.listen(config.port, () => {
  //   const url = `http://localhost:${config.port}`;
  //   logger.info(`FB-Post service running on port ${config.port}`);
  //   logger.info(`Environment: ${config.nodeEnv}`);
  //   logger.info(`Open API: ${url}`);
  //   logger.info(`Health check: ${url}/api/health`);
  // });

  if (!module.parent) {
    server = app.listen(config.port, () => {
      const url = `http://localhost:${config.port}`;

      logger.info(`FB-Post service running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Open API: ${url}`);
      logger.info(`Health check: ${url}/api/health`);
    });
  }
};

startServer();

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).send(err.stack);
// });

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

module.exports = app;
