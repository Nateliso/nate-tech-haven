const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  dueDate: { type: Date, required: true }, // When rental’s due back
  returned: { type: Boolean, default: false },
});

module.exports = mongoose.model("Rental", RentalSchema);