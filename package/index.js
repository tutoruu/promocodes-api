import axios from "axios";

class GetPromo {
  constructor(api_url, options) {
    this.api = axios.create({
      baseURL: api_url,
    });
    this.options = options;
  }

  async get(code, user_id) {
    const { data } = await this.api.get(`code/${code}/${user_id}`);
    return data;
  }

  applyDiscount(promo, value) {
    console.log(value)
    if (promo.discount_type === "percentage")
      return value * ((100 - promo.discount) / 100);
    else if (promo.discount_type === "hard_amount")
      return value - promo.discount;
  }

  async use(code, user_id, product) {
    const { data } = await this.api.post("use-code", { code, user_id, product });
    return data;
  }
}

export default new GetPromo("https://getpromo.herokuapp.com/");
