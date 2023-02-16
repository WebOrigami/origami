import { outputFrontMatter } from "../core/utilities.js";
import OrigamiTemplate from "../framework/OrigamiTemplate.js";

/**
 * Apply the indicated Origami template to the given input and return the
 * result. If the input is text with front matter, the front matter will be
 * preserved.
 *
 * @this {Explorable}
 * @param {StringLike} document
 * @param {any} [input]
 * @param {boolean} [preserveFrontMatter]
 */
export default async function orit(
  document,
  input,
  preserveFrontMatter = false
) {
  const template = new OrigamiTemplate(document, this);

  /** @type {any} */
  let templateResult = await template.apply(input, this);

  let result = await outputFrontMatter(templateResult, document.toGraph?.());

  return result;
}

orit.usage = `orit template, input\tApply an Origami template to input data`;
orit.documentation = "https://graphorigami.org/cli/builtins.html#orit";
