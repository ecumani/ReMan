const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./routers/index");
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.listen(5000, () => {
  console.log(`Server has started at port 5000`);
});
