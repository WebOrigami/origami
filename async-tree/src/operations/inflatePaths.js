import SyncMap from "../drivers/SyncMap.js";
import * as args from "../utilities/args.js";
import keysFromPath from "../utilities/keysFromPath.js";

/**
 * Given a mapping of string paths to values, return the described tree.
 */
export default async function inflatePaths(maplike, options = {}) {
  const map = await args.map(maplike, "Tree.inflatePaths");

  const classFn = options.classFn ?? SyncMap;
  const result = new classFn();
  for await (const [path, value] of map) {
    const keys = keysFromPath(path);
    setValue(result, keys, value, classFn);
  }
  return result;
}

// Add the value to the tree at the given path of keys
function setValue(map, keys, value, classFn) {
  let node = map;
  for (const key of keys.slice(0, -1)) {
    // Create a new node if one doesn't exist yet
    node = node.getOrInsertComputed(key, () => new classFn());
  }
  node.set(keys[keys.length - 1], value);
}
