import { outputWithGraph } from "../core/utilities.js";
import OrigamiTemplate from "../framework/OrigamiTemplate.js";

/**
 * Apply the indicated Origami template to the given input and return the
 * result. If the input is text with front matter, the front matter will be
 * preserved.
 *
 * @this {Explorable}
 * @param {StringLike} document
 * @param {any} [input]
 * @param {boolean} [emitFrontMatter]
 */
export default async function orit(document, input, emitFrontMatter = false) {
  const template = new OrigamiTemplate(document, this);

  /** @type {any} */
  const templateResult = await template.apply(input, this);
  const result = emitFrontMatter
    ? await outputWithGraph(
        templateResult,
        document.toGraph?.(),
        emitFrontMatter
      )
    : templateResult;
  return result;
}

orit.usage = `orit template, input\tApply an Origami template to input data`;
orit.documentation = "https://graphorigami.org/cli/builtins.html#orit";
