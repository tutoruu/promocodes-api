const { generateCode } = require("../helpers/generators");

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
