const { getPromoByCode } = require("./getters");

module.exports.updatePromoFields = async function (code, fields) {
  let promo = await getPromoByCode(code);

  if(!promo) return

  for (const [key, value] of Object.entries(fields)) promo[key] = value;
  return (await promo.save())._doc
};
