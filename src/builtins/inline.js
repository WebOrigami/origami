import orit from "./orit.js";

/**
 * Concatenate the text content of objects or graphs.
 *
 * @this {Explorable}
 * @param {StringLike} input
 */
export default async function inline(input) {
  const result = await orit.call(this, input, null, true);
  return result;
}

inline.usage = `inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/cli/builtins.html#inline";
