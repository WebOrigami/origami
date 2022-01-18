import HandlebarsTemplate from "../../app/HandlebarsTemplate.js";

/**
 * Apply the indicated Handlebars template to the given data and return the
 * result.
 *
 * @this {Explorable}
 * @param {string} templateText
 * @param {Explorable|PlainObject|string} [input]
 */
export default async function hbs(templateText, input) {
  const template = new HandlebarsTemplate(templateText, this);
  return await template.apply(input, this);
}

hbs.usage = `hbs <template, data>\tGenerate content from a Handlebars template and data`;
