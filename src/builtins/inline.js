import orit from "./orit.js";

/**
 * Concatenate the text content of objects or graphs.
 *
 * @this {Explorable}
 * @param {StringLike} text
 */
export default async function inline(text) {
  const result = await orit.call(this, text, null, true);
  return result;
}

inline.usage = `inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/cli/builtins.html#inline";
