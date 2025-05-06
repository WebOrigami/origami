import { Tree } from "../internal.js";
import { toString } from "../utilities.js";
import deepText from "./deepText.js";

/**
 * A tagged template literal function that concatenate the deep text values in a
 * tree. Any treelike values will be concatenated using `deepText`.
 *
 * @param {TemplateStringsArray} strings
 * @param  {...any} values
 */
export default async function text(strings, ...values) {
  // Convert all the values to strings
  const valueTexts = await Promise.all(
    values.map((value) =>
      Tree.isTreelike(value) ? deepText(value) : toString(value)
    )
  );
  // Splice all the strings together
  let result = strings[0];
  for (let i = 0; i < valueTexts.length; i++) {
    result += valueTexts[i] + strings[i + 1];
  }
  return result;
}
