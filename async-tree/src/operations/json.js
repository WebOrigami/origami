import getMapArgument from "../utilities/getMapArgument.js";
import toPlainValue from "../utilities/toPlainValue.js";

/**
 * Render the given tree in JSON format.
 *
 * @param {import("../../index.ts").Maplike} maplike
 */
export default async function json(maplike) {
  const tree = await getMapArgument(maplike, "json");
  const value = await toPlainValue(tree);
  return JSON.stringify(value, null, 2);
}
