import { Tree } from "../internal.js";
import { toString } from "../utilities.js";

/**
 * Return the deep values of the tree as a generator of strings.
 *
 * @param {import("../../index.ts").Treelike} treelike
 */
export default async function* deepStrings(treelike) {
  const values = Tree.deepValuesIterator(treelike, { expand: true });
  for await (let value of values) {
    if (typeof value === "function") {
      value = await value();
    }
    const text = toString(value);
    if (text != null) {
      yield text;
    }
  }
}
