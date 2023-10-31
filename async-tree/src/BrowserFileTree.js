import * as Tree from "./Tree.js";
import { hiddenFileNames, isStringLike, sortNatural } from "./utilities.js";

const TypedArray = Object.getPrototypeOf(Uint8Array);

/**
 * A tree of files backed by a browser-hosted file system such as the standard
 * Origin Private File System or the (as of October 2023) experimental File
 * System Access API.
 *
 * @typedef {import("@graphorigami/types").AsyncMutableTree} AsyncMutableTree
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
    const directory = await this.getDirectory();

    // Try the key as a subfolder name.
    try {
      const subfolderHandle = await directory.getDirectoryHandle(key);
      return Reflect.construct(this.constructor, [subfolderHandle]);
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

    // Try the key as a file name.
    try {
      const fileHandle = await directory.getFileHandle(key);
      const file = await fileHandle.getFile();
      return file.arrayBuffer();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "NotFoundError")) {
        throw error;
      }
    }

    return undefined;
  }

  async getDirectory() {
    this.directory ??= await navigator.storage.getDirectory();
    return this.directory;
  }

  async keys() {
    const directory = await this.getDirectory();
    let keys = [];
    // @ts-ignore
    for await (const key of directory.keys()) {
      keys.push(key);
    }
    // Filter out unhelpful file names.
    keys = keys.filter((key) => !hiddenFileNames.includes(key));
    sortNatural(keys);
    return keys;
  }

  async set(key, value) {
    const directory = await this.getDirectory();

    if (value === undefined) {
      // Delete file.
      try {
        await directory.removeEntry(key);
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
      const fileHandle = await directory.getFileHandle(key, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(value);
      await writable.close();
    } else if (Tree.isTreelike(value)) {
      // Treat value as a tree and write it out as a subdirectory.
      const subdirectory = await directory.getDirectoryHandle(key, {
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
