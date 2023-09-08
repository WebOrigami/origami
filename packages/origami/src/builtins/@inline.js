import { outputWithGraph } from "../common/serialize.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import loadOrigamiTemplate from "../loaders/ori.js";

/**
 * Inline any Origami expressions found inside {{...}} placeholders in the input
 * text.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").StringLike} StringLike
 *
 * @this {AsyncDictionary|null}
 * @param {StringLike} input
 * @param {boolean} [emitFrontMatter]
 */
export default async function inline(input, emitFrontMatter) {
  assertScopeIsDefined(this);
  const inputText = String(input);
  const template = await loadOrigamiTemplate.call(this, inputText);
  let templateResult = await template.apply(input, this);
  let result = emitFrontMatter
    ? await outputWithGraph(
        templateResult,
        await templateResult.toGraph(),
        true
      )
    : templateResult;
  result = String(result);
  return result;
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/language/@inline.html";
