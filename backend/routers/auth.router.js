const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
router.use(express.json());

router.post("/signup", async (req, res) => {
  const { name, email, phone_no, password, role } = req.body;

  // Validate input
  if (!name || !email || !password || !role || !phone_no) {
    return res
      .status(400)
      .json({ message: "Name, email, password, and role are required." });
  }

  if (!["Tenant", "Landlord"].includes(role)) {
    return res
      .status(400)
      .json({ message: "Role must be either 'Tenant' or 'Landlord'." });
  }

  try {
    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into the database
    const newUser = await pool.query(
      `INSERT INTO users (name, email, phone_no, password, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING user_id, name, email, phone_no, role`,
      [name, email, phone_no, hashedPassword, role]
    );

    res.status(201).json({
      message: "User registered successfully.",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // Check if user exists
    const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Return user info and token
    res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone_no: user.phone_no,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
