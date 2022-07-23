const Mongoose = require("mongoose");

const promoSchema = new Mongoose.Schema({
  name: String,
  code: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  max_uses: {
    type: Number,
    default: 1,
  },
  max_uses_per_user: {
    type: Number,
    default: 1,
  },
  restrict_to: [String],
  restrict_to_products: [String],
  discount: {
    type: Number,
    required: true,
  },
  discount_type: {
    type: String,
    default: "percentage", // or hard_amount (20% vs 20EGP)
  },
  used_by: [
    {
      user: String,
      frequency: Number,
    },
  ],
  expiry_date: {
    type: Date,
    required: true,
  },
  is_expired: {
    type: Boolean,
    default: false,
  },
});

promoSchema.methods.getUser = function (user_id) {
  let matchedUsers = this.used_by.filter((use) => use.user === user_id);
  if (!matchedUsers || matchedUsers?.length === 0) return;
  return matchedUsers[0];
};

promoSchema.methods.incrementUserFrequency = async function (user_id) {
  let matchedUsers = this.used_by.filter((use) => use.user === user_id);
  if (!matchedUsers || matchedUsers?.length === 0)
    this.used_by.push({ user: user_id, frequency: 1 });
  else matchedUsers[0].frequency++;

  await this.save();
  return matchedUsers[0];
};

promoSchema.methods.computeNumberOfUses = function () {
  let uses = 0;
  for (use of this.used_by) uses += use.frequency;
  return uses;
};

promoSchema.methods.isExpired = async function () {
  let today = new Date();
  if (
    this.is_expired ||
    today >= this.expiry_date ||
    this.max_uses <= this.computeNumberOfUses()
  ) {
    this.is_expired = true;
    await this.save();
    return { message: "Promocode expired", eligible: false };
  }
  return { eligible: true };
};

promoSchema.methods.isUserEligible = async function (user_id, product) {
  if (!this.active) return { message: "Promocode inactive", eligible: false };

  let promoUser = this.getUser(user_id);
  if (!!promoUser && this.max_uses_per_user <= promoUser.frequency)
    return { message: "Maximum uses reached", eligible: false };
  else if (
    !!this.restrict_to &&
    !!this.restrict_to.length > 0 &&
    !this.restrict_to.includes(user_id)
  )
    return {
      message: "User doesn't have access to use this promocode",
      eligible: false,
    };
  else if (
    !!this.restrict_to_products &&
    !!this.restrict_to_products.length > 0 &&
    !this.restrict_to_products.includes(product)
  )
    return {
      message: "Promocode invalid",
      eligible: false,
    };
  else return await this.isExpired();
};

promoSchema.methods.use = async function (user_id, product) {
  const status = await this.isUserEligible(user_id, product);
  if (!status.eligible)
    return {
      message: status.message || "User ineligeble to use code",
      used: false,
    };
  else {
    await this.incrementUserFrequency(user_id);
    return { promo: this, used: true };
  }
};

module.exports = Mongoose.model("Promo", promoSchema);
