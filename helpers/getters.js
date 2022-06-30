const Promo = require("../models/Promo");

module.exports.getPromoByCode = async function (code, user_id) {
  const promo = await Promo.findOne({ code });

  if (!user_id || !promo) return promo;
  else {
    const eligible = await promo.isUserEligible(user_id);
    const times_used = promo.getUser(user_id)?.frequency || 0;
    const times_remaining = promo.max_uses_per_user - times_used;

    return { promo, ...eligible, times_used, times_remaining };
  }
};
