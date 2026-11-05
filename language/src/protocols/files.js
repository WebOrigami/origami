import { FileMap, isUnpackable, scope, Tree } from "@weborigami/async-tree";
import os from "node:os";
import path from "node:path";
import OrigamiFileMap from "../runtime/OrigamiFileMap.js";
import executionContext from "../runtime/executionContext.js";

/**
 * Return the file or directory indicated by the given path of keys.
 *
 * @param {string[]} keys
 */
export default async function files(...keys) {
  let current;

  let head = keys.shift();
  if (head === "~") {
    // Head of path is home directory
    current = new OrigamiFileMap(os.homedir());
    await current.initializeGlobals();
  } else {
    // Find head key in scope
    const parent = executionContext.getStore()?.parent;
    if (!parent) {
      throw new Error("files: No parent context available.");
    }
    const parentScope = scope(parent);
    current = await parentScope.get(head);
    if (!current) {
      throw new ReferenceError(`files: Unable to find "${head}" in scope.`);
    }
  }

  while (keys.length > 0) {
    const key = keys[0];
    let value = await current.get(key);
    if (value instanceof FileMap) {
      keys.shift();
      current = value;
    } else if (value) {
      keys.shift();
      if (keys.length === 0) {
        // The file is the end of the path
        return value;
      }
      // Traverse with remaining keys
      if (isUnpackable(value)) {
        value = await value.unpack();
      }
      return Tree.traverse(value, ...keys);
    } else if (keys.at(-1)?.endsWith("/")) {
      // Last argument has slash, create map for not-yet-existing directory
      const result = mapForNewDirectory(current, keys);
      return result;
    } else if (keys.length === 1) {
      // It's acceptable for the last key to not exist, value is undefined
      return undefined;
    } else {
      const folderPath = path.join(current.path, ...keys);
      throw new ReferenceError(
        `files: The folder "${key}" in this path doesn't exist: ${folderPath}`,
      );
    }
  }

  return current;
}

function mapForNewDirectory(parent, keys) {
  let current = parent;
  for (const key of keys) {
    current = mapForNewChild(current, key);
  }
  return current;
}

function mapForNewChild(parent, key) {
  const dirPath = path.join(parent.path, key);
  const result = new OrigamiFileMap(dirPath);
  result.parent = parent;
  return result;
}
