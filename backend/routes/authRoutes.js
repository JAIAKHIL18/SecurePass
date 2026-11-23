const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validatePassword, passwordRegex, validatePasswordDFA, getDFAAnalysis, PERMITTED_SPECIALS } = require("../middleware/passwordValidation");
const { JWT_SECRET, verifyToken, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Email format validation regular expression
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==================== 1. PUBLIC / NORMAL USER PASSWORD CHECK ====================
// Returns user-friendly strength and basic requirements with suggestions.
// Contains ZERO technical DFA/Regex details.
router.post("/check", (req, res) => {
    const { password } = req.body;
    if (typeof password !== "string") {
        return res.status(400).json({
            success: false,
            message: "Password must be a string"
        });
    }

    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};:',.<>/?]/.test(password);
    const noWhitespace = password.length > 0 && !/\s/.test(password);
    const onlyPermitted = password.length > 0 && /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:',.<>/?]+$/.test(password);

    const isValid = hasMinLength && hasUpper && hasLower && hasDigit && hasSpecial && noWhitespace && onlyPermitted;

    const requirements = [
        { id: "length", label: "At least 8 characters", met: hasMinLength },
        { id: "upper", label: "At least one uppercase letter (A-Z)", met: hasUpper },
        { id: "lower", label: "At least one lowercase letter (a-z)", met: hasLower },
        { id: "digit", label: "At least one number (0-9)", met: hasDigit },
        { id: "special", label: "At least one special character (!@#$%...)", met: hasSpecial },
        { id: "whitespace", label: "No spaces or whitespace", met: noWhitespace }
    ];

    const passedCount = requirements.filter(r => r.met).length;

    let strength = "Enter a password";
    if (password.length > 0) {
        if (passedCount <= 2) strength = "Weak";
        else if (passedCount <= 4) strength = "Moderate";
        else if (passedCount === 5) strength = "Strong";
        else strength = "Very Strong";
    }

    // Friendly recommendations for normal users
    const suggestions = [];
    if (!hasMinLength) suggestions.push("Make your password at least 8 characters long.");
    if (!hasUpper) suggestions.push("Add an uppercase letter (A-Z) to strengthen your password.");
    if (!hasLower) suggestions.push("Add a lowercase letter (a-z).");
    if (!hasDigit) suggestions.push("Include at least one number (0-9).");
    if (!hasSpecial) suggestions.push("Include a special character (e.g. ! @ # $ %).");
    if (!noWhitespace && password.length > 0) suggestions.push("Remove any spaces or whitespace.");
    if (!onlyPermitted && password.length > 0) suggestions.push("Remove any unsupported or illegal symbols.");
    if (isValid) suggestions.push("Great job! Your password meets all security criteria.");

    return res.status(200).json({
        success: true,
        isValid,
        strength,
        passedRequirements: passedCount,
        totalRequirements: requirements.length,
        requirements,
        suggestions
    });
});

// ==================== 2. ADMIN-ONLY TECHNICAL ANALYSIS ====================
// Protected endpoint: strictly requires authenticated administrator
router.post("/analyze", requireAdmin, (req, res) => {
    const { password } = req.body;
    if (typeof password !== "string") {
        return res.status(400).json({
            success: false,
            message: "Password must be a string"
        });
    }

    const validation = validatePassword(password);
    const dfaState = getDFAAnalysis(password);

    return res.status(200).json({
        success: true,
        authenticatedAdmin: {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role
        },
        technicalAnalysis: {
            passwordLength: password.length,
            regexResult: validation.regexResult,
            dfaResult: validation.dfaResult,
            agreement: validation.regexResult === validation.dfaResult,
            isValid: validation.isValid,
            regexPattern: String(passwordRegex),
            dfaState: dfaState.finalState || (validation.dfaResult ? "ACCEPT (q8_U1_L1_D1_S1)" : "REJECT / INTERMEDIATE"),
            isTrap: dfaState.isTrap || false,
            trapReason: dfaState.trapReason || null,
            requirementsBreakdown: validation.requirements,
            formalDefinition: {
                statesCount: 145,
                alphabetSize: 94,
                startState: "q0_U0_L0_D0_S0",
                acceptState: "q8_U1_L1_D1_S1",
                trapState: "TRAP_REJECT"
            }
        }
    });
});

// ==================== 3. REGISTER (ENFORCES USER ROLE) ====================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Missing fields check
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Full name is required"
            });
        }

        if (!email || typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        if (!password || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();

        // 2. Validate email format
        if (!EMAIL_REGEX.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address (e.g., user@example.com)"
            });
        }

        // 3. Validate password using policy
        const validation = validatePassword(password);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Password does not meet security requirements",
                requirements: validation.requirements
            });
        }

        // 4. Duplicate email check
        const existingUser = await User.findOne({ email: trimmedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        // 5. Hash password with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 6. Create user — STRICTLY ENFORCE 'user' role regardless of req.body.role!
        const newUser = new User({
            name: trimmedName,
            email: trimmedEmail,
            password: hashedPassword,
            role: "user" // RBAC invariant: public registrations cannot assign admin role
        });

        await newUser.save();

        // 7. Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(201).json({
            success: true,
            message: "Registration successful! You can now log in.",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Registration Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during registration. Please try again later."
        });
    }
});

// ==================== 4. LOGIN ====================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        if (!password || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }

        const trimmedEmail = email.trim().toLowerCase();

        if (!EMAIL_REGEX.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address format"
            });
        }

        const user = await User.findOne({ email: trimmedEmail });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token with user role
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role || "user", name: user.name },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "user",
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during login. Please try again later."
        });
    }
});

// ==================== 5. USER LOGIN (DEDICATED USER PORTAL) ====================
// Only checks password for client authentication — zero technical terms required.
router.post("/user-login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const trimmedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: trimmedEmail });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role || "user", name: user.name },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            success: true,
            message: "User login successful!",
            portal: "client",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "user",
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("User Login Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error during user login"
        });
    }
});

// ==================== 6. ADMIN LOGIN (DEDICATED COMPANY PORTAL) ====================
// Company side: strictly enforces administrator credentials and unlocks technical automata analysis.
router.post("/admin-login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Administrator email and master password are required"
            });
        }

        const trimmedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: trimmedEmail });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid administrator credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid administrator credentials"
            });
        }

        // Strictly verify administrator role
        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access Denied: Account does not possess company administrator privileges."
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: "admin", name: user.name },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            success: true,
            message: "Company Administrator verified! Technical diagnostics unlocked.",
            portal: "company",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: "admin",
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Admin Login Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error during admin authentication"
        });
    }
});

// ==================== 7. CURRENT USER VERIFICATION ====================
router.get("/me", verifyToken, (req, res) => {
    return res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            createdAt: req.user.createdAt
        }
    });
});

module.exports = router;
