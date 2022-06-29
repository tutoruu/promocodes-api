const Mongoose = require("mongoose")

const userSchema = new Mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    availablePromos: [{
        promo: { ref: "Promo", type: Mongoose.Types.ObjectId },
        frequency: Number
    }],
    usedPromos: [{
        promo: { ref: "Promo", type: Mongoose.Types.ObjectId },
        frequency: Number
    }],
})

module.exports = Mongoose.model("User", userSchema)