const Promo = require("../models/Promo");

export async function getPromoByCode(code) {
    return await Promo.findOne({ code });
}
