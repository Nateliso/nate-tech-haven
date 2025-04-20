const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  type: { type: String, enum: ["buy", "rent"], required: true },
  quantity: { type: Number, default: 1, min: 1 },
  addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CartItem", CartItemSchema);