require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");
// const bookRoutes = require("./routes/book.router");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server working fine :D" });
});

// app.use("/books", bookRoutes);

connectDB();

app.listen(process.env.PORT || 3000);
