import * as args from "../utilities/args.js";
import reduce from "./reduce.js";

/**
 * Visit every node in the tree and return `undefined`.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} source
 */
export default async function visit(source) {
  const tree = await args.map(source, "Tree.visit", { deep: true });
  return reduce(tree, () => undefined);
}
