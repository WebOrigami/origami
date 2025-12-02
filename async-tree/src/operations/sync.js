import getMapArgument from "../utilities/getMapArgument.js";
import reduce from "./reduce.js";

/**
 * Resolve the async tree to a synchronous tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} source
 */
export default async function sync(source) {
  const tree = await getMapArgument(source, "sync");
  return reduce(tree, (mapped) => mapped);
}
