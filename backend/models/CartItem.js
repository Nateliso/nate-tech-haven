const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, default: 1 },
  isRental: { type: Boolean, required: true }, // Buy or rent
});

module.exports = mongoose.model("CartItem", CartItemSchema);