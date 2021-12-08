import hbs from "../eg/commands/hbs.js";

/**
 * A representation of a Handlebars template that has both a string form
 * and a function form that can be invoked to apply the template to data.
 */
export default class HandlebarsTemplate extends String {
  toFunction() {
    const template = this.toString();
    /** @this {Explorable} */
    return async function (data) {
      return data !== undefined
        ? await hbs.call(this, template, data)
        : await hbs.call(this, template);
    };
  }
}
