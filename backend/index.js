require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const returnsRoutes = require("./routes/returns");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173", "https://nate-tech-haven.netlify.app", ],
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/returns", returnsRoutes);


app.get("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoints are not accessible via GET" });
});

app.get("/", (req, res) => {
  res.send("Hello from Tech Haven");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Tech Haven online at http://localhost:${PORT}`);
});