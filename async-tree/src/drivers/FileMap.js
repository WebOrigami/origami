import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hiddenFileNames } from "../constants.js";
import { SyncMap } from "../internal.js";
import * as trailingSlash from "../trailingSlash.js";
import handleDotKey from "../utilities/handleDotKey.js";
import interop from "../utilities/interop.js";
import isPacked from "../utilities/isPacked.js";
import isStringlike from "../utilities/isStringlike.js";
import naturalOrder from "../utilities/naturalOrder.js";
import * as resolveChildPath from "../utilities/resolveChildPath.js";

/**
 * A file system folder as a Map.
 *
 * File values are returned as Uint8Array instances. The underlying Node fs API
 * returns file contents as instances of the Node-specific Buffer class, but
 * that class has some incompatible method implementations; see
 * https://nodejs.org/api/buffer.html#buffers-and-typedarrays. For greater
 * compatibility, files are returned as standard Uint8Array instances instead.
 */
export default class FileMap extends SyncMap {
  constructor(location) {
    if (location instanceof URL) {
      location = location.href;
    } else if (
      !(
        typeof location === "string" ||
        /** @type {any} */ (location) instanceof String
      )
    ) {
      throw new TypeError("FileMap constructor needs a string or URL");
    }

    super();
    this.dirname = location.startsWith("file://")
      ? fileURLToPath(location)
      : path.resolve(process.cwd(), location);
  }

  // Return the (possibly new) subdirectory with the given key.
  child(key) {
    const childPath = resolveChildPath.required(this.dirname, key);

    const stats = getStats(childPath);
    if (stats === null || !stats.isDirectory()) {
      if (stats !== null) {
        // File with the same name exists; delete it.
        fs.rmSync(childPath);
      }
      // Ensure the directory exists.
      fs.mkdirSync(childPath, { recursive: true });
    }

    const child = Reflect.construct(this.constructor, [childPath]);
    child.parent = this;
    return child;
  }

  clear() {
    // Ensure this directory exists.
    fs.mkdirSync(this.dirname, { recursive: true });

    // Clear any existing contents
    super.clear();
  }

  delete(key) {
    const childPath = resolveChildPath.required(this.dirname, key);
    try {
      fs.rmSync(childPath, { recursive: true });
      return true;
    } catch (/** @type {any} */ error) {
      if (error.code === "ENOENT") {
        return false; // File or directory didn't exist
      }
      throw error;
    }
  }

  get(key) {
    let value = handleDotKey(this, key);
    if (value) {
      return value;
    }

    // TODO: We eventually want FileMap to interpret a trailing slash as a
    // subdirectory and immediately return a FileMap instance for it. Until
    // that's done, it's possible for someone to call get("file.txt/") with a
    // trailing slash and still expect to get the plain file. So we have to
    // remove the trailing slash here.
    let valuePath = resolveChildPath.optional(
      this.dirname,
      trailingSlash.remove(key),
    );

    if (valuePath === undefined) {
      // TODO: Remove the empty string special case and deprecation warning
      // and instead return undefined.

      // return undefined;
      if (key === "") {
        return undefined;
      }
      interop.warn(
        `Warning: ".", "..", and "/" are deprecated in file keys: "${key}"`,
      );
      valuePath = `${this.path}/${key}`;
    }

    const stats = getStats(valuePath);
    if (stats === null) {
      if (trailingSlash.has(key)) {
        // Assume this is a reference to a desired but nonexistent subdirectory
        value = Reflect.construct(this.constructor, [valuePath]);
      } else if (directoryExists(this.path)) {
        // This directory exists, but doesn't have the indicated file or subfolder
        return undefined;
      } else {
        // return undefined;
        throw new Error(
          `Tried to access "${key}" in a directory that doesn't exist: ${this.path}`,
        );
      }
    } else if (stats.isDirectory()) {
      // Return subdirectory as an instance of this class
      value = Reflect.construct(this.constructor, [valuePath]);
    } else {
      // Return file contents as a standard Uint8Array
      const buffer = fs.readFileSync(valuePath);
      value = Uint8Array.from(buffer);
    }

    value.parent = this;
    return value;
  }

  keys() {
    let dirEntries;
    try {
      dirEntries = fs.readdirSync(this.dirname, { withFileTypes: true });
    } catch (/** @type {any} */ error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      // Directory doesn't exist yet; treat as empty
      dirEntries = [];
    }

    // Add slashes to directory names.
    let names = dirEntries.map((dirEntry) =>
      trailingSlash.toggle(dirEntry.name, dirEntry.isDirectory()),
    );

    // Filter out unhelpful file names.
    names = names.filter((name) => !hiddenFileNames.includes(name));

    // Node fs.readdir sort order appears to be unreliable; see, e.g.,
    // https://github.com/nodejs/node/issues/3232.
    names.sort(naturalOrder);

    return names[Symbol.iterator]();
  }

  get path() {
    return this.dirname;
  }

  set(key, value) {
    const childPath = resolveChildPath.required(this.dirname, key);

    // Ensure this directory exists.
    const dirname = path.dirname(childPath);
    fs.mkdirSync(dirname, { recursive: true });

    if (typeof value === "function") {
      // Invoke function; write out the result.
      value = value();
    }

    let packed = false;
    if (value === null) {
      // Treat null value as empty string; will create an empty file.
      value = "";
      packed = true;
    } else if (value instanceof ArrayBuffer) {
      // Convert ArrayBuffer to Uint8Array, which Node.js can write directly.
      value = new Uint8Array(value);
      packed = true;
    } else if (!(value instanceof String) && isPacked(value)) {
      // As of Node 22, fs.writeFile is incredibly slow for large String
      // instances. Instead of treating a String instance as a Packed value, we
      // want to consider it as a stringlike below. That will convert it to a
      // primitive string before writing — which is orders of magnitude faster.
      packed = true;
    } else if (typeof value.pack === "function") {
      // Pack the value for writing.
      value = value.pack();
      packed = true;
    } else if (isStringlike(value)) {
      // Value has a meaningful `toString` method, use that.
      value = String(value);
      packed = true;
    }

    if (packed) {
      writeFile(value, childPath);
    } else if (packed == null) {
      throw new TypeError(
        `${this.constructor.name}: Cannot write a ${value === null ? "null" : "undefined"} value to a file.`,
      );
    } else {
      const typeName = value?.constructor?.name ?? "unknown";
      throw new TypeError(`Cannot write a value of type ${typeName} as ${key}`);
    }

    return this;
  }

  trailingSlashKeys = true;
}

function directoryExists(dirPath) {
  const stats = getStats(dirPath);
  return stats !== null && stats.isDirectory();
}

// Return stats for the path, or null if it doesn't exist.
function getStats(filePath) {
  let stats;
  try {
    stats = fs.statSync(filePath);
  } catch (/** @type {any} */ error) {
    if (error.code === "ENOENT" /* File not found */) {
      return null;
    }
    throw error;
  }
  return stats;
}

// Write a value to a file.
function writeFile(value, destPath) {
  // If path exists and it's a directory, delete the directory first.
  const stats = getStats(destPath);
  if (stats !== null && stats.isDirectory()) {
    fs.rmSync(destPath, { recursive: true });
  }

  // Write out the value as the contents of a file.
  fs.writeFileSync(destPath, value);
}
