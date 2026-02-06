import getMapArgument from "../utilities/getMapArgument.js";

/**
 * Set a key/value pair in a map.
 *
 * @typedef  {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {any} key
 * @param {any} value
 */
export default async function set(maplike, key, value) {
  const map = await getMapArgument(maplike, "Tree.set");
  await map.set(key, value);

  // Unlike Map.prototype.set, we return undefined. This is more useful when
  // calling set in the console -- return the complete tree would result in it
  // being dumped to the console.
  return undefined;
}
