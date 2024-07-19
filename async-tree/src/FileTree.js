import * as fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Tree } from "./internal.js";
import {
  getRealmObjectPrototype,
  hiddenFileNames,
  isPacked,
  isPlainObject,
  naturalOrder,
  setParent,
} from "./utilities.js";

/**
 * A file system tree via the Node file system API.
 *
 * File values are returned as Uint8Array instances. The underlying Node fs API
 * returns file contents as instances of the node-specific Buffer class, but
 * that class has some incompatible method implementations; see
 * https://nodejs.org/api/buffer.html#buffers-and-typedarrays. For greater
 * compatibility, files are returned as standard Uint8Array instances instead.
 *
 * @typedef {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 * @implements {AsyncMutableTree}
 */
export default class FileTree {
  /**
   * @param {string|URL} location
   */
  constructor(location) {
    if (location instanceof URL) {
      location = location.href;
    } else if (
      !(
        typeof location === "string" ||
        /** @type {any} */ (location) instanceof String
      )
    ) {
      throw new TypeError(
        `FileTree constructor needs a string or URL, received an instance of ${
          /** @type {any} */ (location)?.constructor?.name
        }`
      );
    }
    this.dirname = location.startsWith("file://")
      ? fileURLToPath(location)
      : path.resolve(process.cwd(), location);
    this.parent = null;
  }

  async get(key) {
    if (!key) {
      // Undefined key or empty string key is invalid.
      return undefined;
    }

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

    let value;
    if (stats.isDirectory()) {
      // Return subdirectory as a tree
      value = Reflect.construct(this.constructor, [filePath]);
    } else {
      // Return file contents as a standard Uint8Array.
      const buffer = await fs.readFile(filePath);
      value = Uint8Array.from(buffer);
    }

    setParent(value, this);
    return value;
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
    names.sort(naturalOrder);

    return names;
  }

  get path() {
    return this.dirname;
  }

  async set(key, value) {
    // Where are we going to write this value?
    const stringKey = key != null ? String(key) : "";
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

    if (typeof value === "function") {
      // Invoke function; write out the result.
      value = await value();
    }

    let packed = false;
    if (value === null) {
      // Treat null value as empty string; will create an empty file.
      value = "";
      packed = true;
    } else if (!(value instanceof String) && isPacked(value)) {
      // As of Node 22, fs.writeFile is incredibly slow for large String
      // instances. Instead of treating a String instance as a Packed value, we
      // want to consider it as a stringlike below. That will convert it to a
      // primitive string before writing — which is orders of magnitude faster.
      packed = true;
    } else if (typeof value.pack === "function") {
      // Pack the value for writing.
      value = await value.pack();
      packed = true;
    } else if (isStringLike(value)) {
      // Value has a meaningful `toString` method, use that.
      value = String(value);
      packed = true;
    }

    if (packed) {
      // Single writeable value.
      if (value instanceof ArrayBuffer) {
        // Convert ArrayBuffer to Uint8Array, which Node.js can write directly.
        value = new Uint8Array(value);
      }
      // Ensure this directory exists.
      await fs.mkdir(this.dirname, { recursive: true });
      // Write out the value as the contents of a file.
      await fs.writeFile(destPath, value);
    } else if (isPlainObject(value) && Object.keys(value).length === 0) {
      // Special case: empty object means create an empty directory.
      await fs.mkdir(destPath, { recursive: true });
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

  get url() {
    return pathToFileURL(this.dirname);
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
  } else if (obj.toString === getRealmObjectPrototype(obj)?.toString) {
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
