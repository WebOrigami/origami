import {
  FileMap,
  isUnpackable,
  scope,
  trailingSlash,
  TraverseError,
  Tree,
} from "@weborigami/async-tree";
import os from "node:os";
import path from "node:path";
import OrigamiFileMap from "../runtime/OrigamiFileMap.js";
import executionContext from "../runtime/executionContext.js";

/**
 * Return the file or directory indicated by the given path of keys.
 *
 * @param {string[]} keys
 */
export default async function traversePath(...keys) {
  // Expand any keys that contain slashes into separate keys. Preserve
  // leading slashes to keep UNC server name intact.
  keys = splitKeysWithSlashes(keys);

  let { parent, position, value } = await mapForPathHead(keys);

  // For error reporting
  let lastValue;

  while (position < keys.length) {
    const key = keys[position];
    lastValue = value;
    value = await value.get(key);
    position++;
    if (value instanceof FileMap) {
      parent = value;
    } else if (value) {
      // Traverse with remaining keys
      // TODO: Align with exception handling logic in Tree.traverseOrThrow
      if (isUnpackable(value) && trailingSlash.has(key)) {
        value = await value.unpack();
      }
      const remainingKeys = keys.slice(position);
      return remainingKeys.length === 0
        ? value
        : Tree.traverse(value, ...remainingKeys);
    } else if (keys.at(-1)?.endsWith("/")) {
      // Last argument has slash, create map for not-yet-existing directory
      const result = mapForNewDirectory(parent, keys);
      return result;
    } else if (position === keys.length) {
      // Acceptable for the last key to not exist; value is undefined
      return undefined;
    } else {
      /** @type {any} */
      throw new TraverseError("A path hit a null or undefined value.", {
        lastValue,
        keys,
        position,
      });
    }
  }

  return value;
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

/**
 * Given an array of keys, return the initial position and the corresponding
 * value for the map representing the head of the path.
 *
 * @typedef {import("@weborigami/async-tree").SyncOrAsyncMap} SyncOrAsyncMap
 * @returns {Promise<{ parent: FileMap, position: number, value: SyncOrAsyncMap }>}
 */
async function mapForPathHead(keys) {
  let position = 0;
  let head = keys[position];
  if (head === undefined) {
    throw new Error("files: No path provided.");
  }

  // Special cases
  let value = null;
  if (head.startsWith("//") || head.startsWith("\\\\")) {
    // Windows UNC path
    const server = head;
    position++;
    const share = keys[position];
    position++;
    const sharePath = [server, share].join("");
    value = new OrigamiFileMap(sharePath);
  } else if (/^[a-zA-Z]:\//.test(head)) {
    // Windows drive letter
    position++;
    const folder = keys[position];
    position++;
    const folderPath = [head, folder].join("");
    value = new OrigamiFileMap(folderPath);
  } else if (head === "~" || head === "~/") {
    // Home directory
    position++;
    value = new OrigamiFileMap(os.homedir());
  } else if (head === "/") {
    // Root directory
    position++;
    value = new OrigamiFileMap("/");
  }

  let parent;
  if (value) {
    // Need to initialize globals for this file map
    await value.initializeGlobals();
    parent = value;
  } else {
    // Default path head is the current scope
    parent = executionContext.getStore()?.parent;
    if (!parent) {
      throw new Error("files: No parent context available.");
    }
    value = scope(parent);
  }

  return { parent, position, value };
}

// TODO: Remove
async function oldFiles(...args) {
  // If path begins with `~`, treat it relative to the home directory.
  // Otherwise, treat it relative to the current container.
  let relativePath = args.join(path.sep);
  let basePath;
  if (relativePath.startsWith("~")) {
    basePath = os.homedir();
    relativePath = relativePath.slice(2);
  } else {
    const parent = executionContext.getStore()?.parent;
    basePath = parent.path;
  }
  const resolved = path.resolve(basePath, relativePath);

  const result = new OrigamiFileMap(resolved);
  await result.initializeGlobals();
  return result;
}

// Expand any keys that contain slashes into separate keys. Preserve leading
// slashes to keep UNC server name intact.
function splitKeysWithSlashes(keys) {
  return keys.flatMap((key) => key.match(/\/*[^/]+(\/|$)/g) ?? key);
}
