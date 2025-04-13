require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routes/products");

const app = express();

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Hello from Tech Haven");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Tech Haven online at http://localhost:${PORT}`);
});