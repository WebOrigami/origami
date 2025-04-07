import { Tree } from "../internal.js";
import concat from "./concat.js";

/**
 * A tagged template literal function that concatenate the deep text values in a
 * tree. Any treelike values will be concatenated using `concat`.
 *
 * @param {TemplateStringsArray} strings
 * @param  {...any} values
 */
export default async function concatTrees(strings, ...values) {
  // Convert all the values to strings
  const valueTexts = await Promise.all(
    values.map((value) => (Tree.isTreelike(value) ? concat(value) : value))
  );
  // Splice all the strings together
  let result = strings[0];
  for (let i = 0; i < valueTexts.length; i++) {
    result += valueTexts[i] + strings[i + 1];
  }
  return result;
}
