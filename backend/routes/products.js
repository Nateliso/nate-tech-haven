const express = require("express");
const router = express.Router();
const Product = require("../models/Product");


// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark VR & Drone products as rentable
router.put("/update-rentables", async (req, res) => {
  try {
    const result = await Product.updateMany(
      { category: { $in: ["VR", "Drones"] } },
      { $set: { rentable: true } }
    );
    res.status(200).json({
      message: "Rentable products updated",
      matched: result.matchedCount,
      modified: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;