import getMapArgument from "../utilities/getMapArgument.js";
import setParent from "../utilities/setParent.js";
import isMap from "./isMap.js";

/**
 * Return the child node with the indicated key, creating it if necessary.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function child(maplike, key) {
  const map = await getMapArgument(maplike, "assign", { position: 0 });

  let result;

  const hasChildMethod = "child" in map && typeof map.child === "function";
  if (hasChildMethod) {
    // Use tree's own child() method
    result = map.child(key);
  } else {
    // Default implementation
    result = await map.get(key);

    // If child is already a map we can use it as is
    if (!isMap(result)) {
      // Create new child node using no-arg constructor
      result = new /** @type {any} */ (map).constructor();
      await map.set(key, result);
      setParent(result, map);
    }
  }

  return result;
}
