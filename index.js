const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors({ origin: "*" }));

const logger = require("morgan");
app.use(logger("dev"));

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."));

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("GetPromo");
});

const GetPromo = require("./middleware/GetPromo");
const Promo = require("./models/Promo");
const { tryCatch, s, e } = require("./helpers/utils");
const { getPromoByCode, getPromosByProduct } = require("./helpers/getters");

app.post("/create-promo", GetPromo, async (req, res) => {
  await tryCatch(async () => {
    const promo = await new Promo(req.promo).save();
    s("New Promocode created!", { promo }, res);
  }, res);
});

app.get("/code/:code", async (req, res) => {
  const { code } = req.params;
  await tryCatch(async () => {
    const promo = await getPromoByCode(code);
    if (!promo) return e(404, `promocode ${code} not found.`, res);

    s("Promocode found!", { promo }, res);
  }, res);
});

app.get("/code/:code/:user_id", async (req, res) => {
  const { code, user_id } = req.params;
  await tryCatch(async () => {
    const promo = await getPromoByCode(code, user_id);
    if (!promo) return e(404, `promo with code ${code} not found.`, res);

    s("Promocode found!", promo, res);
  }, res);
});

app.get("/code/:code/:user_id/:product", async (req, res) => {
  const { code, user_id, product } = req.params;
  await tryCatch(async () => {
    const promo = await getPromoByCode(code, user_id, product);
    if (!promo) return e(404, `promo with code ${code} not found.`, res);

    s("Promocode found!", promo, res);
  }, res);
});

app.get("/product-codes/:product", async (req, res) => {
  const { product } = req.params;
  await tryCatch(async () => {
    const promos = await getPromosByProduct(product);
    res.send(promos);
  }, res);
});

app.post("/use-code", async (req, res) => {
  const { code, user_id, product } = req.body;
  await tryCatch(async () => {
    let promo = await getPromoByCode(code);
    if (!promo) return e(404, `promo with code ${code} not found.`, res);

    promo = await promo.use(user_id, product);
    if (!promo.used) return e(400, `${promo.message}`, res);

    promo = await getPromoByCode(code, user_id, product); // get updated verion with user information
    s("Promocode used!", promo, res);
  }, res);
});

app.listen(PORT, () => {
  console.log(`GetPromo live on port ${PORT}`);
});
