import * as args from "../utilities/args.js";
import reduce from "./reduce.js";

/**
 * Resolve the async tree to a synchronous tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} source
 */
export default async function sync(source) {
  const tree = await args.map(source, "Tree.sync");
  return reduce(tree, (mapped) => mapped);
}
