import StringWithGraph from "../common/StringWithGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
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

  let result;
  const frontGraph = document.toGraph?.();
  if (frontGraph) {
    const frontData = await ExplorableGraph.toYaml(frontGraph);
    const text = `---
${frontData.trimEnd()}
---
${templateResult}`;
    result = new StringWithGraph(text, frontGraph);
  } else {
    result = templateResult;
  }

  return result;
}

orit.usage = `orit template, input\tApply an Origami template to input data`;
orit.documentation = "https://graphorigami.org/cli/builtins.html#orit";
