import {
  FileMap,
  interop,
  isUnpackable,
  scope,
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
export default async function files(...keys) {
  // TEMPORARY HACK: Find out whether the source code used `files:` protocol.
  const context = executionContext.getStore();
  const code = context?.code;
  const usedFilesProtocol = code?.source?.startsWith("files:");
  if (usedFilesProtocol && !keys.at(-1)?.endsWith("/")) {
    interop.warn(
      `Warning: The files: protocol will soon require a trailing slash if you want to create a new directory: ${keys.at(-1)}/`,
    );
    return oldFiles(...keys);
  }

  // Expand any keys that contain slashes into separate keys. Preserve
  // leading slashes to keep UNC server name intact.
  keys = keys.flatMap((key) => key.match(/\/*[^/]+(\/|$)/g) ?? key);

  // For error reporting
  let lastValue;
  let position = 0;

  let head = keys[position];
  if (head === undefined) {
    throw new Error("files: No path provided.");
  }

  // Special cases for head of path
  let value;
  let parent; // Where new directory would be created
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

  if (value) {
    // Need to initialize globals for this file map
    await value.initializeGlobals();
    parent = value;
  } else {
    // Start traversal in current scope
    parent = executionContext.getStore()?.parent;
    if (!parent) {
      throw new Error("files: No parent context available.");
    }
    value = scope(parent);
  }

  while (position < keys.length) {
    const key = keys[position];
    lastValue = value;
    value = await value.get(key);
    position++;
    if (value instanceof FileMap) {
      value = value;
      parent = value;
    } else if (value) {
      if (position >= keys.length) {
        // The file is the end of the path
        return value;
      }
      // Traverse with remaining keys
      if (isUnpackable(value)) {
        value = await value.unpack();
      }
      const remainingKeys = keys.slice(position);
      return Tree.traverse(value, ...remainingKeys);
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
