import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import orit from "./orit.js";

/**
 * Concatenate the text content of objects or graphs.
 *
 * @this {Explorable}
 * @param {StringLike} input
 * @param {boolean} [emitFrontMatter]
 */
export default async function inline(input, emitFrontMatter) {
  assertScopeIsDefined(this);
  const result = await orit.call(this, input, null, emitFrontMatter);
  return result;
}

inline.usage = `inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/cli/builtins.html#inline";
