const Mongoose = require("mongoose");
const { getPromoByCode } = require("../helpers/getters.js");

const promoSchema = new Mongoose.Schema({
    name: String,
    code: {
        type: String,
        required: true
    },
    max_uses: {
        type: Number,
        default: 1
    },
    max_uses_per_user: {
        type: Number,
        default: 1
    },
    restrict_to: [{ ref: "User", type: Mongoose.Types.ObjectId }],
    discount: {
        type: Number,
        required: true
    },
    discount_type: {
        type: String,
        default: "percentage" // or hard_amount (20% vs 20EGP)
    },
    used_by: [{
        user: { ref: "User", type: Mongoose.Types.ObjectId },
        frequency: Number
    }],
    expiry_date: {
        type: Date,
        default: new Date().setDate(new Date().getDate() + 7) // expires after 1 week by default
    },
    is_expired: {
        type: Boolean,
        default: false
    }
});

promoSchema.methods.generateCode = async function () {
    // send get request to random word generator and concatonate the words
    let code = axios.get('https://random-word-api.herokuapp.com/word?length=3').join('-');
    
    // if code already exists -> retry
    let exists = await getPromoByCode(code)
    if (exists) return this.generateCode();
    
    return code
}

promoSchema.methods.getUser = function (user) {
    let matchedUsers = this.used_by.filter(use => use.user === user);
    if(!matchedUsers || matchedUsers?.length === 0) return;
    return matchedUsers[0]
}

promoSchema.methods.computeNumberOfUses = function () {
    let uses = 0;
    for(use of this.used_by) uses += use.frequency;
    return uses
}

promoSchema.methods.isUserEligibile = function(user) {
    if (!!this.restrict_to && !this.restrict_to.includes(user.email)) return false;
    if (this.max_uses >= this.computeNumberOfUses()) return false;
    
    let promoUser = this.getUser(user.email)
    if (!!promoUser && this.max_uses_per_user >= promoUser.frequency) return false;
    
    return true
}

module.exports = Mongoose.model("Promo", promoSchema)