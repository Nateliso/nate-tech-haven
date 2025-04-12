require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB Atlas");
    const TestSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model("Test", TestSchema);
    await Test.create({ name: "Tech Haven Initialized" });
    console.log("DB initialized with test collection");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error:", err);
  });