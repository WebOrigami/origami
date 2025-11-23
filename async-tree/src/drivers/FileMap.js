import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hiddenFileNames } from "../constants.js";
import * as trailingSlash from "../trailingSlash.js";
import isPacked from "../utilities/isPacked.js";
import isStringlike from "../utilities/isStringlike.js";
import naturalOrder from "../utilities/naturalOrder.js";
import setParent from "../utilities/setParent.js";
import SyncMap from "./SyncMap.js";

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
    const stringKey = key != null ? String(key) : "";
    const baseKey = trailingSlash.remove(stringKey);
    const destPath = path.resolve(this.dirname, baseKey);
    const destTree = Reflect.construct(this.constructor, [destPath]);

    const stats = getStats(destPath);
    if (stats === null || !stats.isDirectory()) {
      if (stats !== null) {
        // File with the same name exists; delete it.
        fs.rmSync(destPath);
      }
      // Ensure the directory exists.
      fs.mkdirSync(destPath, { recursive: true });
    }

    return destTree;
  }

  delete(key) {
    if (key === "" || key == null) {
      // Can't have a file with no name or a nullish name
      throw new Error("delete: key was empty or nullish");
    }

    // What file or directory are we going to delete?
    const stringKey = key != null ? String(key) : "";
    const baseKey = trailingSlash.remove(stringKey);
    const destPath = path.resolve(this.dirname, baseKey);

    try {
      fs.rmSync(destPath, { recursive: true });
      return true;
    } catch (/** @type {any} */ error) {
      if (error.code === "ENOENT") {
        return false; // File or directory didn't exist
      }
      throw error;
    }
  }

  get(key) {
    if (key == null) {
      // Reject nullish key
      throw new ReferenceError(
        `${this.constructor.name}: Cannot get a null or undefined key.`
      );
    }
    if (key === "") {
      // Can't have a file with no name
      return undefined;
    }

    key = trailingSlash.remove(key); // normalize key
    const filePath = path.resolve(this.dirname, key);

    const stats = getStats(filePath);
    if (stats === null) {
      return undefined; // File or directory doesn't exist
    }

    let value;
    if (stats.isDirectory()) {
      // Return subdirectory as an instance of this class
      value = Reflect.construct(this.constructor, [filePath]);
    } else {
      // Return file contents as a standard Uint8Array
      const buffer = fs.readFileSync(filePath);
      value = Uint8Array.from(buffer);
    }

    value.parent =
      key === ".."
        ? // Special case: ".." parent is the grandparent (if it exists)
          this.parent?.parent
        : this;
    setParent(value, this);

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
      trailingSlash.toggle(dirEntry.name, dirEntry.isDirectory())
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
    // Where are we going to write this value?
    const stringKey = key != null ? String(key) : "";
    const normalized = trailingSlash.remove(stringKey);
    const destPath = path.resolve(this.dirname, normalized);

    // Ensure this directory exists.
    const dirname = path.dirname(destPath);
    fs.mkdirSync(dirname, { recursive: true });

    if (value === undefined) {
      // Special case: undefined value is equivalent to delete()
      this.delete(normalized);
      return this;
    }

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
      writeFile(value, destPath);
    } else {
      const typeName = value?.constructor?.name ?? "unknown";
      throw new TypeError(
        `Cannot write a value of type ${typeName} as ${stringKey}`
      );
    }

    return this;
  }

  trailingSlashKeys = true;
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
