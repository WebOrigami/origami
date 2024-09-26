import * as trailingSlash from "../src/trailingSlash.js";
import { Tree } from "./internal.js";
import {
  hiddenFileNames,
  isStringLike,
  naturalOrder,
  setParent,
} from "./utilities.js";

const TypedArray = Object.getPrototypeOf(Uint8Array);

/**
 * A tree of files backed by a browser-hosted file system such as the standard
 * Origin Private File System or the (as of October 2023) experimental File
 * System Access API.
 *
 * @typedef {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 * @implements {AsyncMutableTree}
 */
export default class BrowserFileTree {
  /**
   * Construct a tree of files backed by a browser-hosted file system.
   *
   * The directory handle can be obtained via any of the [methods that return a
   * FileSystemDirectoryHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle).
   * If no directory is supplied, the tree is rooted at the Origin Private File
   * System for the current site.
   *
   * @param {FileSystemDirectoryHandle} [directoryHandle]
   */
  constructor(directoryHandle) {
    /** @type {FileSystemDirectoryHandle}
     * @ts-ignore */
    this.directory = directoryHandle;
  }

  async get(key) {
    if (key == null) {
      // Reject nullish key.
      throw new ReferenceError(
        `${this.constructor.name}: Cannot get a null or undefined key.`
      );
    }
    if (key === "") {
      // Can't have a file with no name
      return undefined;
    }

    // Remove trailing slash if present
    key = trailingSlash.remove(key);

    const directory = await this.getDirectory();

    // Try the key as a subfolder name
    try {
      const subfolderHandle = await directory.getDirectoryHandle(key);
      const value = Reflect.construct(this.constructor, [subfolderHandle]);
      setParent(value, this);
      return value;
    } catch (error) {
      if (
        !(
          error instanceof DOMException &&
          (error.name === "NotFoundError" || error.name === "TypeMismatchError")
        )
      ) {
        throw error;
      }
    }

    // Try the key as a file name
    try {
      const fileHandle = await directory.getFileHandle(key);
      const file = await fileHandle.getFile();
      const buffer = file.arrayBuffer();
      setParent(buffer, this);
      return buffer;
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "NotFoundError")) {
        throw error;
      }
    }

    return undefined;
  }

  // Return the directory handle, creating it if necessary. We can't create the
  // default value in the constructor because we need to await it.
  async getDirectory() {
    this.directory ??= await navigator.storage.getDirectory();
    return this.directory;
  }

  async keys() {
    const directory = await this.getDirectory();
    let keys = [];
    // @ts-ignore
    for await (const entryKey of directory.keys()) {
      // Check if the entry is a subfolder
      const baseKey = trailingSlash.remove(entryKey);
      const subfolderHandle = await directory
        .getDirectoryHandle(baseKey)
        .catch(() => null);
      const isSubfolder = subfolderHandle !== null;

      const key = trailingSlash.toggle(entryKey, isSubfolder);
      keys.push(key);
    }

    // Filter out unhelpful file names.
    keys = keys.filter((key) => !hiddenFileNames.includes(key));
    keys.sort(naturalOrder);

    return keys;
  }

  async set(key, value) {
    const baseKey = trailingSlash.remove(key);
    const directory = await this.getDirectory();

    if (value === undefined) {
      // Delete file.
      try {
        await directory.removeEntry(baseKey);
      } catch (error) {
        // If the file didn't exist, ignore the error.
        if (
          !(error instanceof DOMException && error.name === "NotFoundError")
        ) {
          throw error;
        }
      }
      return this;
    }

    // Treat null value as empty string; will create an empty file.
    if (value === null) {
      value = "";
    }

    // True if fs.writeFile can directly write the value to a file.
    let isWriteable =
      value instanceof ArrayBuffer ||
      value instanceof TypedArray ||
      value instanceof DataView ||
      value instanceof Blob;

    if (!isWriteable && isStringLike(value)) {
      // Value has a meaningful `toString` method, use that.
      value = String(value);
      isWriteable = true;
    }

    if (isWriteable) {
      // Write file.
      const fileHandle = await directory.getFileHandle(baseKey, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(value);
      await writable.close();
    } else if (Tree.isTreelike(value)) {
      // Treat value as a tree and write it out as a subdirectory.
      const subdirectory = await directory.getDirectoryHandle(baseKey, {
        create: true,
      });
      const destTree = Reflect.construct(this.constructor, [subdirectory]);
      await Tree.assign(destTree, value);
    } else {
      const typeName = value?.constructor?.name ?? "unknown";
      throw new TypeError(`Cannot write a value of type ${typeName} as ${key}`);
    }

    return this;
  }
}
