const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// Get all orders for authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).populate("items.productId");
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.patch("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["pending", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // Restore stockRent for returned rentals
    if (status === "delivered" && order.items.some(item => item.type === "rent")) {
      for (const item of order.items.filter(item => item.type === "rent")) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockRent: item.quantity }
        });
      }
    }

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update order error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;