const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const buyerRequestRoutes = require("./routes/buyerRequestRoutes");
const agentRoutes = require("./routes/agentRoutes");

dotenv.config();

const app = express();

// ==========================================
// CORS CONFIGURATION
// ==========================================
app.use(
  cors({
    origin: [
      "https://agricproject.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(express.json());

// ==========================================
// DATABASE
// ==========================================
connectDB();

// ==========================================
// ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/buyer-requests", buyerRequestRoutes);
app.use("/api/agent", agentRoutes);

// ==========================================
// TEST ROUTE
// ==========================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AgriConnect AI backend is running",
  });
});

// ==========================================
// SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AgriConnect AI server running on port ${PORT}`);
});