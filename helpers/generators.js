const { getPromoByCode } = require("./getters.js");
const axios = require("axios");

module.exports.generateCode = async function (number = 3, length = 4) {
  // send get request to random word generator and concatonate the words
  const { data } = await axios.get(
    `https://random-word-api.herokuapp.com/word?number=${number}&length=${length}`
  );
  let code = data.join("-");

  // if code already exists -> retry
  let exists = await getPromoByCode(code);
  if (exists) return await this.generateCode();

  return code;
};
