require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  {
    name: "Razer DeathAdder Mouse",
    buyPrice: 69.99,
    stockBuy: 50,
    description: "Ergonomic gaming mouse.",
    category: "Keyboards",
    imageUrl: "https://example.com/razer.jpg",
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    buyPrice: 399.99,
    rentPriceWeek: 29.99,
    stockBuy: 20,
    stockRent: 10,
    description: "Noise-canceling headphones.",
    category: "Audio",
    rentBeforeBuy: true,
  },
  {
    name: "DJI Mini 3 Pro Drone",
    rentPriceWeek: 49.99,
    stockRent: 5,
    description: "Compact 4K drone.",
    category: "Drones",
  },
  {
    name: "Apple MacBook Pro 14",
    buyPrice: 1999.99,
    rentPriceWeek: 99.99,
    stockBuy: 10,
    stockRent: 3,
    description: "M2 Pro chip, 16GB RAM.",
    category: "Laptops",
    rentBeforeBuy: true,
  },
  {
    name: "Logitech MX Keys",
    buyPrice: 119.99,
    stockBuy: 30,
    description: "Wireless keyboard.",
    category: "Keyboards",
  },
  {
    name: "Oculus Quest 2",
    buyPrice: 299.99,
    rentPriceWeek: 39.99,
    stockBuy: 15,
    stockRent: 8,
    description: "All-in-one VR headset.",
    category: "VR",
    rentBeforeBuy: true,
  },
  {
    name: "Bose SoundLink Speaker",
    buyPrice: 129.99,
    stockBuy: 25,
    description: "Portable Bluetooth speaker.",
    category: "Audio",
  },
  {
    name: "Keychron K2 Keyboard",
    buyPrice: 89.99,
    stockBuy: 40,
    description: "Mechanical wireless keyboard.",
    category: "Keyboards",
  },
  {
    name: "GoPro HERO11",
    buyPrice: 399.99,
    rentPriceWeek: 34.99,
    stockBuy: 12,
    stockRent: 6,
    description: "Action camera with 5.3K video.",
    category: "Other",
  },
  {
    name: "NVIDIA Shield TV Pro",
    buyPrice: 199.99,
    stockBuy: 18,
    description: "4K HDR streaming media player.",
    category: "Other",
  },
];

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB Atlas");
    await Product.deleteMany({}); // Clear existing
    await Product.insertMany(products);
    console.log("Seeded 10 products");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error:", err);
  });