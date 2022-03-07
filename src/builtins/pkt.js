import { extractFrontMatter } from "../core/utilities.js";
import PikaTemplate from "../framework/PikaTemplate.js";

/**
 * Apply the indicated Pika template to the given data and return the
 * result.
 *
 * @this {Explorable}
 * @param {string} templateContent
 * @param {Explorable|PlainObject|string} [input]
 * @param {boolean} [preserveFrontMatter]
 */
export default async function pkt(
  templateContent,
  input,
  preserveFrontMatter = false
) {
  let templateText = String(templateContent);
  let frontBlock;
  if (preserveFrontMatter) {
    const frontMatter = extractFrontMatter(templateText);
    if (frontMatter) {
      frontBlock = frontMatter.frontBlock;
    }
  }
  const template = new PikaTemplate(templateText, this);
  let result = await template.apply(input, this);
  if (frontBlock) {
    result = frontBlock + result;
  }
  return result;
}

pkt.usage = `pkt template, input\tApply a Pika template to input data`;
pkt.documentation = "https://explorablegraph.org/pika/builtins.html#pkt";
