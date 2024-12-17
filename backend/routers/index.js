const express = require("express");

const router = express.Router();

router.use("/auth", require("./auth.router"));
router.use("/landlord", require("./landlord.router"));
router.use("/tenant", require("./tenant.router"));
router.use("/properties", require("./property.router"));
router.use("/payments", require("./payment.router"));

module.exports = router;
