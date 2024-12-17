const express = require("express");
const pool = require("../db"); // Assuming you are using pg library for PostgreSQL
const router = express.Router();

// Middleware to handle JSON request bodies
router.use(express.json());

router.put("/:payment_id", async (req, res) => {
  const { payment_id } = req.params;
  const { rent, water_tax, electricity_bill, date_paid, is_paid } = req.body;

  // Validate required fields
  if (is_paid === undefined || date_paid === undefined) {
    return res.status(400).json({
      error: "'is_paid' and 'date_paid' are required fields.",
    });
  }

  // Format the date_paid to 'YYYY-MM-DD' format
  const formattedDatePaid = new Date(date_paid).toISOString().slice(0, 10);

  try {
    // Build the query dynamically based on the provided fields
    const updateFields = [];
    const values = [];

    if (rent !== undefined) {
      updateFields.push(`rent = $${values.length + 1}`);
      values.push(rent);
    }

    if (water_tax !== undefined) {
      updateFields.push(`water_tax = $${values.length + 1}`);
      values.push(water_tax);
    }

    if (electricity_bill !== undefined) {
      updateFields.push(`electricity_bill = $${values.length + 1}`);
      values.push(electricity_bill);
    }

    // Always update 'is_paid' and 'date_paid' as required fields
    updateFields.push(`is_paid = $${values.length + 1}`);
    values.push(is_paid);

    updateFields.push(`date_paid = $${values.length + 1}`);
    values.push(formattedDatePaid);

    // Add the payment_id as the last parameter for the WHERE clause
    values.push(payment_id);

    // Ensure there are fields to update before running the query
    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    // Construct the update query
    const query = `
        UPDATE Payments
        SET ${updateFields.join(", ")}
        WHERE payment_id = $${values.length}
        RETURNING *;
      `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payment record not found." });
    }

    res.status(200).json({
      message: "Payment updated successfully.",
      payment: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating payment:", err.message);
    res.status(500).json({ error: "Failed to update payment." });
  }
});

router.post("/", async (req, res) => {
  const { property_id, month, rent, water_tax, electricity_bill } = req.body;

  // Validate required fields
  if (!property_id || !month) {
    return res.status(400).json({
      error: "Please provide 'property_id' and 'month' (YYYY-MM).",
    });
  }

  // Validate month format
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(month)) {
    return res
      .status(400)
      .json({ error: "Invalid month format. Use 'YYYY-MM' format." });
  }

  const paymentMonth = `${month}-01`; // Add day to comply with DATE format

  try {
    // Step 1: Check if property exists and has a tenant
    const propertyQuery = `
          SELECT property_id, tenant_id
          FROM Property
          WHERE property_id = $1 AND tenant_id IS NOT NULL;
        `;
    const propertyResult = await pool.query(propertyQuery, [property_id]);

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({
        error: `No tenant found for property_id ${property_id}.`,
      });
    }

    const tenantId = propertyResult.rows[0].tenant_id;

    // Step 2: Convert optional fields to number or null (default to null if not provided)
    const rentValue = rent ? parseFloat(rent) : null;
    const waterTaxValue = water_tax ? parseFloat(water_tax) : null;
    const electricityBillValue = electricity_bill
      ? parseFloat(electricity_bill)
      : null;

    // Step 3: Insert payment record with type casting to ensure proper data types
    const insertQuery = `
          INSERT INTO Payments (property_id, rent, water_tax, electricity_bill, payment_month, date_paid, client_id, is_paid)
          VALUES ($1, 
                  COALESCE($2::DECIMAL, NULL), 
                  COALESCE($3::DECIMAL, NULL), 
                  COALESCE($4::DECIMAL, NULL), 
                  $5, 
                  $6, 
                  $7, 
                  $8)
          RETURNING *;
        `;

    const insertValues = [
      property_id,
      rentValue, // rent value (null if not provided)
      waterTaxValue, // water tax value (null if not provided)
      electricityBillValue, // electricity bill value (null if not provided)
      paymentMonth,
      null, // date_paid (null initially)
      tenantId,
      false, // is_paid (default to false)
    ];

    const paymentResult = await pool.query(insertQuery, insertValues);

    res.status(201).json({
      message: `Payment record created successfully for property_id ${property_id} for month ${month}.`,
      payment: paymentResult.rows[0],
    });
  } catch (err) {
    console.error("Error creating payment:", err.message);
    res.status(500).json({ error: "Failed to create payment record." });
  }
});

router.get("/:property_id", async (req, res) => {
  const { property_id } = req.params;

  try {
    // Query to get all payments for a given property_id
    const query = `
        SELECT * FROM Payments
        WHERE property_id = $1
        ORDER BY payment_month DESC;
      `;

    const result = await pool.query(query, [property_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: `No payments found for property_id ${property_id}.`,
      });
    }

    res.status(200).json({
      message: `Payments found for property_id ${property_id}`,
      payments: result.rows,
    });
  } catch (err) {
    console.error("Error fetching payments:", err.message);
    res.status(500).json({ error: "Failed to fetch payments." });
  }
});

module.exports = router;
