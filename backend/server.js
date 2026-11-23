const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const authRoutes = require("./routes/authRoutes");
const initAdmin = require("./utils/initAdmin");

// Allowed origins for CORS (frontend dev server ports)
const allowedOrigins = [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive in dev to avoid blocking
        }
    },
    credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = {
        0: "Disconnected",
        1: "Connected",
        2: "Connecting",
        3: "Disconnecting"
    };

    res.status(200).json({
        success: true,
        service: "SecurePass Backend API",
        status: "Healthy",
        database: states[dbState] || "Unknown",
        timestamp: new Date().toISOString()
    });
});

// Root test route
app.get("/", (req, res) => {
    res.json({
        message: "SecurePass Backend is running!",
        version: "1.0.0",
        endpoints: {
            register: "POST /api/auth/register",
            login: "POST /api/auth/login",
            analyze: "POST /api/auth/analyze",
            health: "GET /api/health"
        }
    });
});

// Connect to MongoDB Atlas
if (!process.env.MONGO_URI) {
    console.error("FATAL: MONGO_URI is not set in environment variables!");
} else {
    mongoose.connect(process.env.MONGO_URI)
        .then(async () => {
            console.log("MongoDB Connected Successfully ✅");
            await initAdmin();
        })
        .catch((error) => {
            console.error("MongoDB Connection Error ❌:", error.message);
        });
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`SecurePass server running on port ${PORT}`);
});

module.exports = app;
