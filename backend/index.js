const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Tech Haven");
});

app.listen(3000, () => {
  console.log("Tech Haven online at http://localhost:3000");
});