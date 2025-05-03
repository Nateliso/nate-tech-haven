const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  buyPrice: { type: Number }, // Null if rent-only
  rentPriceWeek: { type: Number }, // Null if buy-only
  stockBuy: { type: Number, default: 0 },
  stockRent: { type: Number, default: 0 },
  description: { type: String },
  category: { type: String, enum: ["Audio", "Drones", "Laptops", "Keyboards", "VR", "Other"] },
  imageUrl: { type: String },
  rentable: { type: Boolean, default: false }, // Only specific gadgets
});

module.exports = mongoose.model("Product", ProductSchema);