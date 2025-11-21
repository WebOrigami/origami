import { hiddenFileNames } from "../constants.js";
import isMap from "../operations/isMap.js";
import * as trailingSlash from "../trailingSlash.js";
import isStringlike from "../utilities/isStringlike.js";
import naturalOrder from "../utilities/naturalOrder.js";
import setParent from "../utilities/setParent.js";
import AsyncMap from "./AsyncMap.js";

const TypedArray = Object.getPrototypeOf(Uint8Array);

/**
 * A map of files backed by a browser-hosted file system such as the standard
 * Origin Private File System or the (as of October 2023) experimental File
 * System Access API.
 */
export default class BrowserFileMap extends AsyncMap {
  /**
   * Construct a map of files backed by a browser-hosted file system.
   *
   * The directory handle can be obtained via any of the [methods that return a
   * FileSystemDirectoryHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle).
   * If no directory is supplied, the tree is rooted at the Origin Private File
   * System for the current site.
   *
   * @param {FileSystemDirectoryHandle} [directoryHandle]
   */
  constructor(directoryHandle) {
    super();
    this.directory = directoryHandle;
  }

  async child(key) {
    const normalized = trailingSlash.remove(key);
    let result = await this.get(normalized);

    // If child is already a map we can use it as is
    if (!isMap(result)) {
      // Create subfolder
      const directory = await this.getDirectory();
      if (result) {
        // Delete existing file with same name
        await directory.removeEntry(normalized);
      }
      const subfolderHandle = await directory.getDirectoryHandle(normalized, {
        create: true,
      });
      result = Reflect.construct(this.constructor, [subfolderHandle]);
      setParent(result, this);
    }

    return result;
  }

  async delete(key) {
    const normalized = trailingSlash.remove(key);
    const directory = await this.getDirectory();

    // Delete file.
    try {
      await directory.removeEntry(normalized);
    } catch (error) {
      // If the file didn't exist, ignore the error.
      if (error instanceof DOMException && error.name === "NotFoundError") {
        return false;
      }
      throw error;
    }

    return true;
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

  async *keys() {
    const directory = await this.getDirectory();
    let keys = [];
    // @ts-ignore
    for await (const entryKey of directory.keys()) {
      // Check if the entry is a subfolder
      const normalized = trailingSlash.remove(entryKey);
      const subfolderHandle = await directory
        .getDirectoryHandle(normalized)
        .catch(() => null);
      const isSubfolder = subfolderHandle !== null;

      const key = trailingSlash.toggle(entryKey, isSubfolder);
      keys.push(key);
    }

    // Filter out unhelpful file names.
    keys = keys.filter((key) => !hiddenFileNames.includes(key));
    keys.sort(naturalOrder);

    yield* keys;
  }

  async set(key, value) {
    const normalized = trailingSlash.remove(key);
    const directory = await this.getDirectory();

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

    if (!isWriteable && isStringlike(value)) {
      // Value has a meaningful `toString` method, use that.
      value = String(value);
      isWriteable = true;
    }

    if (isWriteable) {
      // Write file.
      const fileHandle = await directory.getFileHandle(normalized, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(value);
      await writable.close();
    } else {
      const typeName = value?.constructor?.name ?? "unknown";
      throw new TypeError(`Cannot write a value of type ${typeName} as ${key}`);
    }

    return this;
  }

  trailingSlashKeys = true;
}
