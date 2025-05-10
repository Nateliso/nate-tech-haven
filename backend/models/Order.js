const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      productName: { type: String, required: true },
      type: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      rentalStatus: { 
        type: String, 
        enum: ["pending", "in rental", "returned"], 
        default: "pending" 
      },
      returnRequest: {
        method: { type: String, enum: ["drop off", "take off"] },
        scheduledDate: { type: Date },
        transportFee: { type: Number, default: 0 },
        status: { type: String, enum: ["pending", "confirmed"], default: "pending" }
      },
      rentalEndDate: { type: Date },
    },
  ],
  totalBuy: { type: Number, default: 0 },
  totalRent: { type: Number, default: 0 },
  rentCredit: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "shipped", "delivered"], default: "pending" },
  deliveryMethod: { 
    type: String, 
    enum: ["delivery", "pickup"], 
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);