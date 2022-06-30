const { generateCode } = require("../helpers/generators");
const dotenv = require("dotenv");
dotenv.config();

const { e } = require("../helpers/utils");

module.exports = async function (req, res, next) {
  let {
    name,
    code,
    max_uses,
    max_uses_per_user,
    restrict_to,
    discount,
    discount_type,
    expiry_date,
  } = req.body;

  if (req.get("x-access-token") !== process.env.AUTHORIZATION_TOKEN) return e(401, "Unautharized to create promo codes", res)

  if (!code) code = await generateCode();
  if (!expiry_date) expiry_date = new Date().setDate(new Date().getDate() + 7);
  if (!discount) discount = 10;

  req.promo = {
    name,
    code,
    max_uses,
    max_uses_per_user,
    restrict_to,
    discount,
    discount_type,
    expiry_date,
  };

  next();
}
