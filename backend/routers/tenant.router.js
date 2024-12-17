const express = require("express");
const pool = require("../db"); // Assuming you are using pg library for PostgreSQL
const router = express.Router();

// Middleware to handle JSON request bodies
router.use(express.json());

router.get("/", async (req, res) => {
  try {
    // Query to fetch all tenants
    const query = `
        SELECT user_id, name, email, phone_no, role
        FROM users
        WHERE role = 'Tenant'
        ORDER BY user_id;
      `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No tenants found." });
    }

    res.status(200).json({
      message: "Tenants retrieved successfully.",
      tenants: result.rows,
    });
  } catch (err) {
    console.error("Error fetching tenants:", err.message);
    res.status(500).json({ error: "Failed to fetch tenants." });
  }
});

module.exports = router;
