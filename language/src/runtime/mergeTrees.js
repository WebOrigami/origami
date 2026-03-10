import {
  isPlainObject,
  isUnpackable,
  symbols,
  trailingSlash,
  Tree,
} from "@weborigami/async-tree";
import assignPropertyDescriptors from "./assignPropertyDescriptors.js";

/**
 * Create a tree that's the result of merging the given trees.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {(Maplike|null)[]} trees
 */
export default async function mergeTrees(...trees) {
  // Filter out null or undefined trees.
  /** @type {Maplike[]}
   * @ts-ignore */
  const filtered = trees.filter((tree) => tree);

  if (filtered.length === 1) {
    // Only one tree, no need to merge.
    return filtered[0];
  }

  // Unpack any packed objects.
  const unpacked = await Promise.all(
    filtered.map((obj) =>
      isUnpackable(obj) ? /** @type {any} */ (obj).unpack() : obj,
    ),
  );

  // If all trees are plain objects, return a plain object.
  if (unpacked.every((tree) => isPlainObject(tree) && !Tree.isMap(tree))) {
    return mergePlainObjects(...unpacked);
  }

  // Merge the trees.
  const result = Tree.merge(...unpacked);
  return result;
}

// Return the merged keys for the given objects, respecting any keys method on
// objects that were created using Origami object literals. This preserves
// trailing slashes.
function mergeObjectKeys(objects) {
  const mergedKeys = new Set();
  for (const obj of objects) {
    const objectKeys =
      typeof obj[symbols.keys] === "function"
        ? obj[symbols.keys]()
        : Object.keys(obj);
    for (const key of objectKeys) {
      const alternateKey = trailingSlash.toggle(key);
      if (mergedKeys.has(alternateKey)) {
        // The new key differs from a key from an earlier object key only by the
        // presence or absence of a trailing slash. Replace that old key.
        mergedKeys.delete(alternateKey);
      }
      mergedKeys.add(key);
    }
  }
  return Array.from(mergedKeys);
}

function mergePlainObjects(...objects) {
  // Use our Object.assign variation that avoids invoking property getters.
  const result = assignPropertyDescriptors({}, ...objects);

  // Attach a keys method
  Object.defineProperty(result, symbols.keys, {
    configurable: true,
    enumerable: false,
    value: () => mergeObjectKeys(objects),
    writable: true,
  });

  return result;
}
