import SyncMap from "../drivers/SyncMap.js";
import * as args from "../utilities/args.js";
import keysFromPath from "../utilities/keysFromPath.js";

/**
 * Given a mapping of string paths to values, return the described tree.
 */
export default async function inflatePaths(maplike) {
  const map = await args.map(maplike, "Tree.flat", { deep: true });

  const result = new SyncMap();
  for await (const [path, value] of map) {
    const keys = keysFromPath(path);
    setValue(result, keys, value);
  }
  return result;
}

// Add the value to the tree at the given path of keys
function setValue(map, keys, value) {
  let node = map;
  for (const key of keys.slice(0, -1)) {
    // Create a new node if one doesn't exist yet
    node = node.getOrInsertComputed(key, () => new SyncMap());
  }
  node.set(keys[keys.length - 1], value);
}
