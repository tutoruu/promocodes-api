const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors({ origin: "*" }));

const logger = require("morgan");
app.use(logger("dev"));

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("open", () => {
  console.log("MongoDB Connected...");
});
mongoose.connection.on("error", (e) => {
  console.log("MongooseError: ", e);
});

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("GetPromo");
});

app.listen(PORT, () => {
  console.log(`GetPromo live on port ${PORT}`);
});