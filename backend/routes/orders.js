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
    // Validate req.body
    if (!req.body || typeof req.body.status !== "string") {
      return res.status(400).json({ message: "Status is required and must be a string" });
    }

    const { status } = req.body;
    if (!["pending", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;

    // Update rentalStatus for rent items
    order.items = order.items.map(item => {
      if (item.type === "rent" && status === "delivered") {
        return { ...item, rentalStatus: "returned" };
      }
      return item;
    });

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

router.patch("/return/:orderId/:itemIndex", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemIndex = parseInt(req.params.itemIndex);
    if (itemIndex < 0 || itemIndex >= order.items.length) {
      return res.status(400).json({ message: "Invalid item index" });
    }

    const item = order.items[itemIndex];
    if (!item.returnRequest || item.returnRequest.status !== "pending") {
      return res.status(400).json({ message: "No pending return request" });
    }

    item.rentalStatus = "returned";
    item.returnRequest.status = "confirmed";

    // Restore stockRent
    if (item.type === "rent") {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockRent: item.quantity }
      });
    }

    await order.save();
    res.json({ message: "Return confirmed", order });
  } catch (err) {
    console.error("Confirm return error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/expire", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId });
    const now = new Date();
    for (const order of orders) {
      let updated = false;
      order.items.forEach((item, index) => {
        if (item.type === "rent" && item.rentalStatus === "in rental" && item.rentalEndDate && new Date(item.rentalEndDate) < now) {
          item.rentalStatus = "returned";
          updated = true;
        }
      });
      if (updated) {
        await order.save();
      }
    }
    res.json({ message: "Expired rentals updated" });
  } catch (err) {
    console.error("Expire rentals error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;