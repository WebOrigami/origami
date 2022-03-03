import PikaTemplate from "../../app/PikaTemplate.js";

/**
 * Apply the indicated Pika template to the given data and return the
 * result.
 *
 * @this {Explorable}
 * @param {string} templateText
 * @param {Explorable|PlainObject|string} [input]
 */
export default async function pkt(templateText, input) {
  const template = new PikaTemplate(templateText, this);
  return await template.apply(input, this);
}
