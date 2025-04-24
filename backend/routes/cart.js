const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const CartItem = require("../models/CartItem");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Add to cart
router.post("/", auth, async (req, res) => {
  try {
    const { productId, type, quantity = 1 } = req.body;
    if (!productId || !type || !["buy", "rent"].includes(type)) {
      return res.status(400).json({ message: "Invalid productId or type" });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const cartItem = await CartItem.create({
      userId: req.userId,
      productId,
      type,
      quantity,
    });
    res.status(201).json({ message: "Added to cart", cartItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// View cart
router.get("/", auth, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.userId }).populate("productId");
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Checkout
router.post("/checkout", auth, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.userId });
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    await CartItem.deleteMany({ userId: req.userId });
    res.status(200).json({ message: "Checkout successful" });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Checkout failed" });
  }
});

module.exports = router;