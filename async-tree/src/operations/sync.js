import * as args from "../utilities/args.js";
import resolve from "./resolve.js";

/**
 * Resolve the async tree to a synchronous tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} source
 */
export default async function sync(source) {
  console.warn("Tree.sync is deprecated. Use Tree.resolve instead.");
  const tree = await args.map(source, "Tree.sync");
  return resolve(tree);
}
