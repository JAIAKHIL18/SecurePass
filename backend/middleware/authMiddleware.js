const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "securepass_secret_jwt_key_2026_default";

/**
 * Middleware: Verify JWT authentication token
 * Attaches authenticated user document to req.user
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Missing or invalid authentication token"
            });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token not provided"
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        // Fetch fresh user record from database to prevent stale token elevation
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User account no longer exists"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Session token has expired. Please log in again."
            });
        }
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid authentication token"
        });
    }
};

/**
 * Middleware: Require Administrator Role (RBAC)
 * Strictly verifies role in the database record
 */
const requireAdmin = async (req, res, next) => {
    // First run token verification
    verifyToken(req, res, () => {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Technical password analysis requires Administrator privileges"
            });
        }
        next();
    });
};

module.exports = {
    JWT_SECRET,
    verifyToken,
    requireAdmin
};
