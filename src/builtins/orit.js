import { extractFrontMatter } from "../core/utilities.js";
import OrigamiTemplate from "../framework/OrigamiTemplate.js";

/**
 * Apply the indicated Origami template to the given data and return the result.
 *
 * @this {Explorable}
 * @param {Buffer|string} templateContent
 * @param {Explorable|PlainObject|Buffer|string|null} [input]
 * @param {boolean} [preserveFrontMatter]
 */
export default async function orit(
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
  const template = new OrigamiTemplate(templateText, this);
  /** @type {any} */
  let result = await template.apply(input, this);
  if (frontBlock) {
    result = frontBlock + result;
  }
  return result;
}

orit.usage = `orit template, input\tApply an Origami template to input data`;
orit.documentation = "https://explorablegraph.org/cli/builtins.html#orit";
