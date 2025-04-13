const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      isRental: Boolean,
      price: Number, // Snapshot at order time
    },
  ],
  totalBuy: { type: Number, default: 0 },
  totalRent: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "shipped", "delivered"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  rentCredit: { type: Number, default: 0 }, // For Rent Before Buy
});

module.exports = mongoose.model("Order", OrderSchema);