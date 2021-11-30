import hbs from "../eg/commands/hbs.js";

export default class HandlebarsTemplate extends String {
  toFunction() {
    const template = this.toString();
    return async function (data) {
      return await hbs.call(this, template, data);
    };
  }
}
