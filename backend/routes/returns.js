const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const auth = require("../middleware/auth");

// Get all in rental items for user
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ 
      user: req.userId,
      "items.rentalStatus": "in rental"
    }).populate("items.productId");
    res.json(orders);
  } catch (err) {
    console.error("Get returns error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Request return for an item
router.post("/:orderId/:itemIndex", auth, async (req, res) => {
  try {
    const { method, scheduledDate } = req.body;
    if (!["drop off", "take off"].includes(method)) {
      return res.status(400).json({ message: "Invalid return method" });
    }
    if (!scheduledDate || isNaN(Date.parse(scheduledDate))) {
      return res.status(400).json({ message: "Valid scheduled date required" });
    }

    const order = await Order.findOne({ _id: req.params.orderId, user: req.userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemIndex = parseInt(req.params.itemIndex);
    if (itemIndex < 0 || itemIndex >= order.items.length) {
      return res.status(400).json({ message: "Invalid item index" });
    }

    const item = order.items[itemIndex];
    if (item.rentalStatus !== "in rental") {
      return res.status(400).json({ message: "Item not in rental" });
    }
    if (item.returnRequest && item.returnRequest.status === "pending") {
      return res.status(400).json({ message: "Return already requested" });
    }

    item.returnRequest = {
      method,
      scheduledDate: new Date(scheduledDate),
      transportFee: method === "take off" ? 10 : 0,
      status: "pending"
    };

    await order.save();
    res.json({ message: "Return requested", order });
  } catch (err) {
    console.error("Request return error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;