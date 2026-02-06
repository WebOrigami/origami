import getMapArgument from "../utilities/getMapArgument.js";
import reduce from "./reduce.js";

/**
 * Visit every node in the tree and return `undefined`.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} source
 */
export default async function visit(source) {
  const tree = await getMapArgument(source, "Tree.visit", { deep: true });
  return reduce(tree, () => undefined);
}
