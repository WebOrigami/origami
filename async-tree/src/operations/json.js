import * as args from "../utilities/args.js";
import toPlainValue from "../utilities/toPlainValue.js";

/**
 * Render the given tree in JSON format.
 *
 * @param {import("../../index.ts").Maplike} maplike
 */
export default async function json(maplike) {
  const tree = await args.map(maplike, "Tree.json");
  const value = await toPlainValue(tree);
  return JSON.stringify(value, null, 2);
}
