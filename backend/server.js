const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const buyerRequestRoutes = require("./routes/buyerRequestRoutes");
const agentRoutes = require("./routes/agentRoutes");

// ==========================================
// LOAD ENVIRONMENT VARIABLES
// ==========================================
dotenv.config();

// ==========================================
// CREATE EXPRESS APP
// ==========================================
const app = express();

// ==========================================
// CONNECT TO DATABASE
// ==========================================
connectDB();

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  "https://agricproject.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(`CORS blocked origin: ${origin}`);

      return callback(new Error(`CORS blocked: ${origin}`));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ==========================================
// BODY PARSER
// ==========================================
app.use(express.json());

// ==========================================
// API ROUTES
// ==========================================

// Authentication
app.use("/api/auth", authRoutes);

app.get("/api/auth/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are loaded",
  });
});

// AI Agent
app.use("/api/agent", agentRoutes);

// Farmer produce listings
app.use("/api/listings", listingRoutes);

// Farmer dashboard
app.use("/api/dashboard", dashboardRoutes);

// Buyer requests
app.use("/api/buyer-requests", buyerRequestRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AgriConnect AI backend is running",
  });
});

// ==========================================
// API HEALTH CHECK
// ==========================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AgriConnect AI API is healthy",
    environment: process.env.NODE_ENV || "development",
  });
});

// ==========================================
// UNKNOWN API ROUTE
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  // Handle CORS errors
  if (error.message && error.message.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: "CORS policy blocked this request",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AgriConnect AI server running on port ${PORT}`);
});