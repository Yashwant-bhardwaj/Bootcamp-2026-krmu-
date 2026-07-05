const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

// Middleware
const cors = require("cors");

app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://merry-platypus-aadf00.netlify.app"
    ],
    credentials: true
}));

app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.send("Login & Signup Backend Running Successfully...");
});

// Auth Routes
app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});