import { outputWithGraph } from "../core/serialize.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import loadOrigamiTemplate from "../loaders/ori.js";

/**
 * Concatenate the text content of objects or graphs.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../core/types").StringLike} StringLike
 *
 * @this {AsyncDictionary|null}
 * @param {StringLike} input
 * @param {boolean} [emitFrontMatter]
 */
export default async function inline(input, emitFrontMatter) {
  assertScopeIsDefined(this);
  const inputText = String(input);
  const template = await loadOrigamiTemplate.call(this, inputText);
  const templateResult = await template.apply(input, this);
  const result = emitFrontMatter
    ? await outputWithGraph(
        templateResult,
        /** @type {any} */ (template).toGraph?.(),
        emitFrontMatter
      )
    : templateResult;
  return result;
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/language/@inline.html";
