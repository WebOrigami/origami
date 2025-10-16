import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hiddenFileNames } from "../constants.js";
import isMaplike from "../manualSync/isTreelike.js";
import * as trailingSlash from "../trailingSlash.js";
import isPacked from "../utilities/isPacked.js";
import isStringlike from "../utilities/isStringlike.js";
import naturalOrder from "../utilities/naturalOrder.js";
import setParent from "../utilities/setParent.js";
import MapBase from "./MapBase.js";

/**
 * A file system folder as a Map.
 *
 * File values are returned as Uint8Array instances. The underlying Node fs API
 * returns file contents as instances of the Node-specific Buffer class, but
 * that class has some incompatible method implementations; see
 * https://nodejs.org/api/buffer.html#buffers-and-typedarrays. For greater
 * compatibility, files are returned as standard Uint8Array instances instead.
 */
export default class FileMap extends MapBase {
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

  delete(key) {
    if (key === "" || key == null) {
      // Can't have a file with no name or a nullish name
      throw new Error("delete: key was empty or nullish");
    }

    // What file or directory are we going to delete?
    const stringKey = key != null ? String(key) : "";
    const baseKey = trailingSlash.remove(stringKey);
    const destPath = path.resolve(this.dirname, baseKey);

    fs.rmSync(destPath, { force: true, recursive: true });

    return true;
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

    let stats;
    try {
      stats = fs.statSync(filePath);
    } catch (/** @type {any} */ error) {
      if (error.code === "ENOENT" /* File not found */) {
        return undefined;
      }
      throw error;
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
    const baseKey = trailingSlash.remove(stringKey);
    const destPath = path.resolve(this.dirname, baseKey);

    // Ensure this directory exists.
    const dirname = path.dirname(destPath);
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
      writeFile(value, destPath);
    } else if (isMaplike(value)) {
      writeDirectory(value, destPath, this);
    } else {
      const typeName = value?.constructor?.name ?? "unknown";
      throw new TypeError(
        `Cannot write a value of type ${typeName} as ${stringKey}`
      );
    }

    return this;
  }
}

// Treat value as a subtree and write it out as a subdirectory.
function writeDirectory(value, destPath, parent) {
  const destTree = Reflect.construct(parent.constructor, [destPath]);

  // Ensure the directory exists.
  fs.mkdirSync(destPath, { recursive: true });

  // Clear any existing files
  destTree.clear();

  // Write out the subtree.
  for (const key of value.keys()) {
    const childValue = value.get(key);
    destTree.set(key, childValue);
  }
}

// Write a value to a file.
function writeFile(value, destPath) {
  // Write out the value as the contents of a file.
  try {
    fs.writeFileSync(destPath, value);
  } catch (/** @type {any} */ error) {
    if (error.code === "EISDIR" /* Is a directory */) {
      throw new Error(
        `Tried to overwrite a directory with a single file: ${destPath}`
      );
    }
  }
}
