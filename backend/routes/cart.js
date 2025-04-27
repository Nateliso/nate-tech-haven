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
    
    if (type === "rent" && !product.rentable) {
      return res.status(400).json({ message: "This product cannot be rented" });
    }
    if (type === "buy" && product.stockBuy < quantity) {
      return res.status(400).json({ message: "Insufficient buy stock" });
    }
    if (type === "rent" && product.stockRent < quantity) {
      return res.status(400).json({ message: "Insufficient rental stock" });
    }

    // Check rental limit (orders + cart)
    if (type === "rent") {
      // Active rentals from orders
      const activeOrders = await Order.find({
        user: req.userId,
        status: { $in: ["pending", "shipped"] },
        "items.type": "rent",
      });
      const activeRentals = activeOrders.reduce((sum, order) => {
        return sum + order.items
          .filter(item => item.type === "rent")
          .reduce((qty, item) => qty + item.quantity, 0);
      }, 0);

      // Rent items in cart
      const cartRentItems = await CartItem.find({
        userId: req.userId,
        type: "rent",
      });
      const cartRentals = cartRentItems.reduce((sum, item) => sum + item.quantity, 0);

      // Total rentals (orders + cart + new item)
      const totalRentals = activeRentals + cartRentals + quantity;
      if (totalRentals > 2) {
        return res.status(400).json({ message: `Cannot rent more than 2 items at a time (current: ${activeRentals} active, ${cartRentals} in cart)` });
      }
    }

    const cartItem = await CartItem.create({
      userId: req.userId,
      productId,
      type,
      quantity,
    });
    res.status(201).json({ message: "Added to cart", cartItem });
  } catch (err) {
    console.error("Add to cart error:", err);
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
    const cartItems = await CartItem.find({ userId: req.userId }).populate("productId");
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check rental limit for rent items
    const rentItems = cartItems.filter(item => item.type === "rent");
    if (rentItems.length > 0) {
      const activeOrders = await Order.find({
        user: req.userId,
        status: { $in: ["pending", "shipped"] },
        "items.type": "rent",
      });
      const activeRentals = activeOrders.reduce((sum, order) => {
        return sum + order.items
          .filter(item => item.type === "rent")
          .reduce((qty, item) => qty + item.quantity, 0);
      }, 0);
      const cartRentals = rentItems.reduce((sum, item) => sum + item.quantity, 0);
      if (activeRentals + cartRentals > 2) {
        return res.status(400).json({ message: `Cannot rent more than 2 items at a time (current: ${activeRentals} active, ${cartRentals} in cart)` });
      }
    }

    // Validate stock and calculate totals
    let totalBuy = 0;
    let totalRent = 0;
    const orderItems = cartItems.map(item => {
      const product = item.productId;
      const price = item.type === "buy" ? product.buyPrice : product.rentPriceWeek;
      if (!price) {
        throw new Error(`Price not available for ${item.type} on ${product.name}`);
      }
      if (item.type === "buy" && product.stockBuy < item.quantity) {
        throw new Error(`Insufficient buy stock for ${product.name}`);
      }
      if (item.type === "rent" && product.stockRent < item.quantity) {
        throw new Error(`Insufficient rental stock for ${product.name}`);
      }
      const itemTotal = price * item.quantity;
      if (item.type === "buy") {
        totalBuy += itemTotal;
      } else {
        totalRent += itemTotal;
      }
      return {
        productId: item.productId._id,
        productName: product.name,
        type: item.type,
        quantity: item.quantity,
        price,
      };
    });

    // Calculate rent credit
    const rentCredit = totalRent * 0.1;

    // Create order
    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      totalBuy,
      totalRent,
      rentCredit,
      status: "pending",
    });

    // Update stock
    for (const item of cartItems) {
      const product = item.productId;
      if (item.type === "buy") {
        await Product.findByIdAndUpdate(product._id, { $inc: { stockBuy: -item.quantity } });
      } else {
        await Product.findByIdAndUpdate(product._id, { $inc: { stockRent: -item.quantity } });
      }
    }

    // Clear cart
    await CartItem.deleteMany({ userId: req.userId });
    res.status(200).json({ message: "Checkout successful", order });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: err.message || "Checkout failed" });
  }
});

module.exports = router;