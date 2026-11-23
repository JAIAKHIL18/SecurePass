const bcrypt = require("bcryptjs");
const User = require("../models/User");

/**
 * Initializes default administrator account if none exists
 * Reads configuration from backend environment variables
 */
const initAdmin = async () => {
    try {
        const adminEmail = (process.env.ADMIN_EMAIL || "admin@securepass.local").toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD || "AdminSecurePass2026!";
        const adminName = process.env.ADMIN_NAME || "System Administrator";

        // Check if an admin account already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const newAdmin = new User({
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: "admin"
            });

            await newAdmin.save();
            console.log(`[RBAC Init] Administrator account configured successfully (${adminEmail}) 🛡️`);
        } else if (existingAdmin.role !== "admin") {
            // Elevate if existing account had user role
            existingAdmin.role = "admin";
            await existingAdmin.save();
            console.log(`[RBAC Init] Existing account elevated to Administrator role (${adminEmail}) 🛡️`);
        } else {
            console.log(`[RBAC Init] Administrator account verified in database (${adminEmail}) ✅`);
        }
    } catch (error) {
        console.error("[RBAC Init Error] Failed to initialize admin account:", error.message);
    }
};

module.exports = initAdmin;
