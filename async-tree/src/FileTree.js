import * as fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as Tree from "./Tree.js";
import {
  getRealmObjectPrototype,
  hiddenFileNames,
  sortNatural,
} from "./utilities.js";

const TypedArray = Object.getPrototypeOf(Uint8Array);

/**
 * A file system tree via the Node file system API.
 *
 * @typedef {import("@graphorigami/types").AsyncMutableTree} AsyncMutableTree
 * @implements {AsyncMutableTree}
 */
export default class FileTree {
  /**
   * @param {string} location
   */
  constructor(location) {
    this.dirname = location.startsWith("file://")
      ? path.dirname(fileURLToPath(location))
      : path.resolve(process.cwd(), location);
    this.parent = null;
  }

  async get(key) {
    const filePath = path.resolve(this.dirname, key);

    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch (/** @type {any} */ error) {
      if (error.code === "ENOENT" /* File not found */) {
        return undefined;
      }
      throw error;
    }

    if (stats.isDirectory()) {
      // Return subdirectory as a tree
      const subtree = Reflect.construct(this.constructor, [filePath]);
      subtree.parent = this;
      return subtree;
    } else {
      // Return file contents
      return fs.readFile(filePath);
    }
  }

  async isKeyForSubtree(key) {
    const filePath = path.join(this.dirname, key);
    const stats = await stat(filePath);
    return stats ? stats.isDirectory() : false;
  }

  /**
   * Enumerate the names of the files/subdirectories in this directory.
   */
  async keys() {
    let entries;
    try {
      entries = await fs.readdir(this.dirname, { withFileTypes: true });
    } catch (/** @type {any} */ error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      entries = [];
    }

    let names = entries.map((entry) => entry.name);

    // Filter out unhelpful file names.
    names = names.filter((name) => !hiddenFileNames.includes(name));

    // Node fs.readdir sort order appears to be unreliable; see, e.g.,
    // https://github.com/nodejs/node/issues/3232.
    sortNatural(names);
    return names;
  }

  get path() {
    return this.dirname;
  }

  async set(key, value) {
    // Where are we going to write this value?
    const stringKey = key ? String(key) : "";
    const destPath = path.resolve(this.dirname, stringKey);

    if (value === undefined) {
      // Delete the file or directory.
      let stats;
      try {
        stats = await stat(destPath);
      } catch (/** @type {any} */ error) {
        if (error.code === "ENOENT" /* File not found */) {
          return this;
        }
        throw error;
      }

      if (stats?.isDirectory()) {
        // Delete directory.
        await fs.rm(destPath, { recursive: true });
      } else if (stats) {
        // Delete file.
        await fs.unlink(destPath);
      }

      return this;
    }

    // Treat null value as empty string; will create an empty file.
    if (value === null) {
      value = "";
    }

    // True if fs.writeFile can directly write the value to a file.
    let isWriteable =
      value instanceof TypedArray ||
      value instanceof DataView ||
      (globalThis.ReadableStream && value instanceof ReadableStream);

    if (!isWriteable && isStringLike(value)) {
      // Value has a meaningful `toString` method, use that.
      value = String(value);
      isWriteable = true;
    }

    if (isWriteable) {
      // Ensure this directory exists.
      await fs.mkdir(this.dirname, { recursive: true });
      // Write out the value as the contents of a file.
      await fs.writeFile(destPath, value);
    } else if (Tree.isTreelike(value)) {
      // Treat value as a tree and write it out as a subdirectory.
      const destTree = Reflect.construct(this.constructor, [destPath]);
      await Tree.assign(destTree, value);
    } else {
      const typeName = value?.constructor?.name ?? "unknown";
      throw new TypeError(
        `Cannot write a value of type ${typeName} as ${stringKey}`
      );
    }

    return this;
  }
}

/**
 * Return true if the object is a string or object with a non-trival `toString`
 * method.
 *
 * @param {any} obj
 */
function isStringLike(obj) {
  if (typeof obj === "string") {
    return true;
  } else if (obj?.toString === undefined) {
    return false;
  } else if (obj.toString === getRealmObjectPrototype(obj).toString) {
    // The stupid Object.prototype.toString implementation always returns
    // "[object Object]", so if that's the only toString method the object has,
    // we return false.
    return false;
  } else {
    return true;
  }
}

// Return the file information for the file/folder at the given path.
// If it does not exist, return undefined.
async function stat(filePath) {
  try {
    // Await the result here so that, if the file doesn't exist, the catch block
    // below will catch the exception.
    return await fs.stat(filePath);
  } catch (/** @type {any} */ error) {
    if (error.code === "ENOENT" /* File not found */) {
      return undefined;
    }
    throw error;
  }
}
