import {
  FileMap,
  interop,
  isUnpackable,
  scope,
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

  let head = keys.shift();
  if (head === undefined) {
    throw new Error("files: No path provided.");
  }

  // Special cases for head of path
  let current;
  let parent; // Where new directory would be created
  if (head.startsWith("//") || head.startsWith("\\\\")) {
    // Windows UNC path
    const server = head;
    const share = keys.shift();
    const sharePath = [server, share].join("");
    current = new OrigamiFileMap(sharePath);
  } else if (/^[a-zA-Z]:\//.test(head)) {
    // Windows drive letter
    const folder = keys.shift();
    const folderPath = [head, folder].join("");
    current = new OrigamiFileMap(folderPath);
  } else if (head === "~" || head === "~/") {
    // Home directory
    current = new OrigamiFileMap(os.homedir());
  } else if (head === "/") {
    // Root directory
    current = new OrigamiFileMap("/");
  }

  if (current) {
    // Need to initialize globals for this file map
    await current.initializeGlobals();
    parent = current;
  } else {
    // Find head key in scope
    parent = executionContext.getStore()?.parent;
    if (!parent) {
      throw new Error("files: No parent context available.");
    }
    current = scope(parent);
    keys.unshift(head); // Process key in loop below
  }

  while (keys.length > 0) {
    const key = keys[0];
    let value = await current.get(key);
    if (value instanceof FileMap) {
      keys.shift();
      current = value;
      parent = current;
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
      const result = mapForNewDirectory(parent, keys);
      return result;
    } else if (keys.length === 1) {
      // It's acceptable for the last key to not exist, value is undefined
      return undefined;
    } else {
      /** @type {any} */
      const folder = current;
      const folderPath = path.join(folder.path, ...keys);
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
