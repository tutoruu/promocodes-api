const Promo = require("../models/Promo");

module.exports.getPromoByCode = async function (code, user_id, product) {
  const promo = await Promo.findOne({ code });

  if (!user_id || !promo) return promo;
  else {
    const eligible = await promo.isUserEligible(user_id, product);
    const times_used = promo.getUser(user_id)?.frequency || 0;
    const times_remaining = promo.max_uses_per_user - times_used;

    return { promo, ...eligible, times_used, times_remaining };
  }
};

module.exports.getPromosByProduct = async function (product) {
  let promos = await Promo.find();
  promos = promos.filter(promo => !!promo.restrict_to_products && promo.restrict_to_products.includes(product))

  promos = promos.map(promo => {
    const times_used = promo.computeNumberOfUses()
    const times_remaining = promo.max_uses - times_used;

    return { promo, times_used, times_remaining };
  });
  
  return promos
};
