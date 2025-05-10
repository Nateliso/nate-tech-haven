const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const Order = require("../models/Order");

// Get cart items
router.get("/", auth, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.userId }).populate("productId");
    res.json(cartItems);
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Add item to cart
router.post("/", auth, async (req, res) => {
  try {
    const { productId, type, quantity } = req.body;
    
    if (!["buy", "rent"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (type === "rent" && (!product.rentable || product.stockRent <= 0)) {
      return res.status(400).json({ message: "Product not rentable or out of rental stock" });
    }

    const stockField = type === "buy" ? "stockBuy" : "stockRent";
    if (product[stockField] < quantity) {
      return res.status(400).json({ message: `Insufficient ${type} stock` });
    }

    // Check active rentals (cart + orders)
    if (type === "rent") {
      // Count rentals in cart
      const cartRentals = await CartItem.find({ userId: req.userId, type: "rent" });
      const cartRentalCount = cartRentals.reduce((sum, item) => sum + item.quantity, 0);
      // Count rentals in orders
      const orders = await Order.find({ user: new mongoose.Types.ObjectId(req.user) });
      let orderRentalCount = 0;
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.type === "rent" && item.rentalStatus === "in rental") {
            orderRentalCount += item.quantity;
          }
        });
      });
      const totalRentals = cartRentalCount + orderRentalCount;
      if (totalRentals + quantity > 2) {
        return res.status(400).json({ message: `Maximum 2 rentals allowed at a time. You have ${totalRentals} active rentals.` });
      }
    }

    let cartItem = await CartItem.findOne({ userId: req.userId, productId, type });
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = new CartItem({
        userId: req.userId,
        productId,
        type,
        quantity,
      });
    }

    await cartItem.save();
    await Product.findByIdAndUpdate(productId, {
      $inc: { [stockField]: -quantity },
    });

    res.json({ message: "Item added to cart", cartItem });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Remove item from cart
router.delete("/:itemId", auth, async (req, res) => {
  try {
    const cartItem = await CartItem.findOne({
      _id: req.params.itemId,
      userId: req.userId,
    });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const stockField = cartItem.type === "buy" ? "stockBuy" : "stockRent";
    await Product.findByIdAndUpdate(cartItem.productId, {
      $inc: { [stockField]: cartItem.quantity },
    });

    await CartItem.deleteOne({ _id: req.params.itemId });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Clear entire cart
router.delete("/", auth, async (req, res) => {
  try {
    await CartItem.deleteMany({ userId: req.userId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Checkout
router.post("/checkout", auth, async (req, res) => {
  try {
    const { deliveryMethod } = req.body;

    if (!["delivery", "pickup"].includes(deliveryMethod)) {
      return res.status(400).json({ message: "Invalid delivery method" });
    }

    const cartItems = await CartItem.find({ userId: req.userId }).populate("productId");
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalBuy = 0;
    let totalRent = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = item.productId;

      if (!product) {
        return res.status(404).json({ message: "A product in your cart was not found (may have been removed)." });
      }

      const stockField = item.type === "buy" ? "stockBuy" : "stockRent";


      if (product[stockField] < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}" (${item.type}). Only ${product[stockField]} left.`,
        });
      }

      // Deduct stock now
      product[stockField] -= item.quantity;
      await product.save();

      const price = item.type === "buy" ? product.buyPrice : product.rentPriceWeek;
      if (item.type === "buy") {
        totalBuy += price * item.quantity;
      } else {
        totalRent += price * item.quantity;
      }

      orderItems.push({
        productId: product._id,
        productName: product.name,
        type: item.type,
        quantity: item.quantity,
        price,
        rentalStatus: item.type === "rent" ? "in rental" : "pending",
        rentalEndDate: item.type === "rent" ? new Date(Date.now() + 31 * 24 * 60 * 60 * 1000) : null, // 31 days
      });
    }

    const order = new Order({
      user: req.userId,
      items: orderItems,
      totalBuy,
      totalRent,
      deliveryMethod,
    });

    await order.save();
    await CartItem.deleteMany({ userId: req.userId });

    res.json({ message: "Checkout successful", order });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: err.message });
  }
});


router.get("/expire", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user });
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