const express = require("express");
const pool = require("../db"); // Assuming you are using pg library for PostgreSQL
const router = express.Router();

// Middleware to handle JSON request bodies
router.use(express.json());

// POST route to add a property
router.post("/", async (req, res) => {
  const { street, city, state, zip_code, property_no, landlord_id } = req.body;

  // Validate required fields
  if (!street || !city || !state || !zip_code || !landlord_id) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Start transaction

    // Step 1: Insert the address into the Address table
    const addressQuery = `
        INSERT INTO Address (street, city, state, zip_code, property_no)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING address_id;
      `;
    const addressValues = [street, city, state, zip_code, property_no];
    const addressResult = await client.query(addressQuery, addressValues);
    const address_id = addressResult.rows[0].address_id;

    // Step 2: Insert the property into the Property table
    const propertyQuery = `
        INSERT INTO Property (address_id, landlord_id)
        VALUES ($1, $2)
        RETURNING property_id;
      `;
    const propertyValues = [address_id, landlord_id];
    const propertyResult = await client.query(propertyQuery, propertyValues);
    const property_id = propertyResult.rows[0].property_id;

    await client.query("COMMIT"); // Commit transaction

    res
      .status(201)
      .json({ message: "Property added successfully.", property_id });
  } catch (err) {
    await client.query("ROLLBACK"); // Rollback transaction in case of error
    console.error(err.message);
    res.status(500).json({ error: "Failed to add property." });
  } finally {
    client.release();
  }
});

router.get("/landlord/:landlord_id", async (req, res) => {
  const { landlord_id } = req.params;

  // Validate landlord_id
  if (!landlord_id) {
    return res.status(400).json({ error: "Landlord ID is required." });
  }

  try {
    // Query to fetch all properties for the given landlord_id, including tenant_id
    const query = `
        SELECT 
          p.property_id,
          p.tenant_id,
          a.address_id,
          a.street,
          a.city,
          a.state,
          a.zip_code,
          a.property_no
        FROM Property p
        JOIN Address a ON p.address_id = a.address_id
        WHERE p.landlord_id = $1
        ORDER BY p.property_id;
      `;

    const result = await pool.query(query, [landlord_id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No properties found for this landlord." });
    }

    res.status(200).json({
      message: "Properties retrieved successfully.",
      properties: result.rows,
    });
  } catch (err) {
    console.error("Error retrieving properties:", err.message);
    res.status(500).json({ error: "Failed to fetch properties." });
  }
});

router.get("/tenant/:tenant_id", async (req, res) => {
  const { tenant_id } = req.params;

  // Validate tenant_id
  if (!tenant_id) {
    return res.status(400).json({ error: "Tenant ID is required." });
  }

  try {
    // Query to fetch all properties for the given tenant_id
    const query = `
        SELECT 
          p.property_id,
          p.landlord_id,
          a.address_id,
          a.street,
          a.city,
          a.state,
          a.zip_code,
          a.property_no
        FROM Property p
        JOIN Address a ON p.address_id = a.address_id
        WHERE p.tenant_id = $1
        ORDER BY p.property_id;
      `;

    const result = await pool.query(query, [tenant_id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No properties found for this tenant." });
    }

    res.status(200).json({
      message: "Properties retrieved successfully.",
      properties: result.rows,
    });
  } catch (err) {
    console.error("Error retrieving properties:", err.message);
    res.status(500).json({ error: "Failed to fetch properties." });
  }
});

router.put("/:property_id", async (req, res) => {
  const { property_id } = req.params;
  const { address_id, landlord_id, tenant_id } = req.body;

  // Validate property_id
  if (!property_id || isNaN(property_id)) {
    return res.status(400).json({ error: "Invalid or missing property_id." });
  }

  try {
    // Check if the property exists
    const propertyCheckQuery = "SELECT * FROM Property WHERE property_id = $1";
    const propertyCheckResult = await pool.query(propertyCheckQuery, [
      property_id,
    ]);

    if (propertyCheckResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: `Property with ID ${property_id} not found.` });
    }

    // Build the dynamic update query
    const updates = [];
    const values = [];
    let counter = 1;

    if (address_id !== undefined) {
      updates.push(`address_id = $${counter++}`);
      values.push(address_id);
    }
    if (landlord_id !== undefined) {
      updates.push(`landlord_id = $${counter++}`);
      values.push(landlord_id);
    }
    if (tenant_id !== undefined) {
      updates.push(`tenant_id = $${counter++}`);
      values.push(tenant_id);
    }

    // If no fields to update, return an error
    if (updates.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided to update the property." });
    }

    // Finalize the query
    const updateQuery = `
        UPDATE Property
        SET ${updates.join(", ")}
        WHERE property_id = $${counter}
        RETURNING *;
      `;

    values.push(property_id); // Add property_id as the last parameter

    // Execute the update query
    const updateResult = await pool.query(updateQuery, values);

    res.status(200).json({
      message: "Property updated successfully.",
      property: updateResult.rows[0],
    });
  } catch (err) {
    console.error("Error updating property:", err.message);
    res.status(500).json({ error: "Failed to update the property." });
  }
});

module.exports = router;
