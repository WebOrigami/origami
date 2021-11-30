import hbs from "../eg/commands/hbs.js";

export default class HandlebarsTemplate extends String {
  toFunction() {
    const template = this.toString();
    // @ts-ignore
    return async function (data) {
      // @ts-ignore
      return await hbs.call(this, template, data);
    };
  }
}
