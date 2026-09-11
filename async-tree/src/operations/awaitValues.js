import * as args from "../utilities/args.js";
import reduce from "./reduce.js";

/**
 * Await all values in the async tree to produce a synchronous tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} source
 */
export default async function awaitValues(source) {
  const tree = await args.map(source, "Tree.resolve", { deep: true });
  return reduce(tree, (mapped) => mapped);
}
