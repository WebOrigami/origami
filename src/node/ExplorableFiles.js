import * as fs from "fs/promises";
import path from "path";
import process from "process";
import { pathToFileURL } from "url";
import YAML from "yaml";
import ExplorableGraph from "../core/ExplorableGraph.js";
import {
  isPlainObject,
  sortNatural,
  toSerializable,
} from "../core/utilities.js";

export default class ExplorableFiles {
  constructor(dirname) {
    this.dirname = path.resolve(process.cwd(), dirname);
    this.cache = new Map();
  }

  async *[Symbol.asyncIterator]() {
    let entries;
    try {
      entries = await fs.readdir(this.dirname, { withFileTypes: true });
    } catch (/** @type {any} */ error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      entries = [];
    }
    const names = entries.map((entry) => entry.name);
    // Use natural sort order instead of OS sort order.
    const sorted = sortNatural(names);
    yield* sorted;
  }

  // Get the contents of the file or directory named by the given key.
  async get(key) {
    const valueRef = this.cache.get(key);
    let value = valueRef?.deref();
    if (value) {
      // Cache hit
      return value;
    }

    const objPath = path.resolve(this.dirname, String(key));
    const stats = await stat(objPath);
    if (!stats) {
      return undefined;
    } else if (stats.isDirectory()) {
      // Return an explorable graph for the subfolder.
      value = Reflect.construct(this.constructor, [objPath]);
    } else {
      // Return the file's contents as a Buffer.
      value = await fs.readFile(objPath);
    }
    this.cache.set(key, new WeakRef(value));
    return value;
  }

  async import(...keys) {
    const filePath = path.join(this.dirname, ...keys);
    // On Windows, absolute paths must be valid file:// URLs.
    const fileUrl = pathToFileURL(filePath);
    const modulePath = fileUrl.href;

    // Try to load the module.
    let obj;
    try {
      obj = await import(modulePath);
    } catch (/** @type {any} */ error) {
      if (error.code !== "ERR_MODULE_NOT_FOUND") {
        throw error;
      }

      // Does the module exist as a file?
      const stats = await stat(filePath);
      if (stats) {
        // Module exists, but we can't load it, probably due to a syntax error.
        throw new SyntaxError(`Error loading ${filePath}`);
      }

      // Module doesn't exist.
      return undefined;
    }

    // If the module loaded and defines a default export, return that, otherwise
    // return the overall module.
    return obj?.default ?? obj;
  }

  async isKeyExplorable(key) {
    const filePath = path.join(this.dirname, key);
    const stats = await stat(filePath);
    return stats ? stats.isDirectory() : false;
  }

  get path() {
    return this.dirname;
  }

  /**
   * Write the contents for the file named by the given key. If the value is
   * undefined, delete the file or directory. If only one argument is passed and
   * it is explorable, apply the explorable's values to the current graph.
   *
   * @param {any} key
   * @param {any} value
   */
  async set(key, value) {
    if (arguments.length === 1) {
      // Take the single argument as a source graph and write its values into
      // the current graph.
      const sourceGraph = ExplorableGraph.from(key);
      await writeFiles(sourceGraph, this);
    } else if (value === undefined) {
      // Delete file or directory.
      const objPath = path.join(this.dirname, key);
      const stats = await stat(objPath);
      if (stats?.isDirectory()) {
        // Delete directory.
        await fs.rm(objPath, { recursive: true });
      } else if (stats) {
        // Delete file.
        await fs.unlink(objPath);
      }
    } else if (
      ExplorableGraph.isExplorable(value) &&
      !(key?.endsWith(".json") || key?.endsWith(".yaml"))
    ) {
      // Write the explorable's values into the subfolder named by the key.
      // However, if the key ends in .json or .yaml, let the next condition
      // write out the graph as a JSON/YAML file.
      const subfolder = path.resolve(this.dirname, String(key));
      const targetGraph = Reflect.construct(this.constructor, [subfolder]);
      await writeFiles(value, targetGraph);
    } else {
      // Ensure the directory exists.
      await fs.mkdir(this.dirname, { recursive: true });

      // Write out the value as the contents of a file.
      const filePath = path.join(this.dirname, key.toString());
      const data = await prepareData(key, value);
      await fs.writeFile(filePath, data);
    }
  }
}

// Determine the form in which we want to write the data to disk under the given
// key.
async function prepareData(key, value) {
  // If the value is already serializable, return it as is.
  if (
    value instanceof Buffer ||
    value instanceof Uint8Array ||
    value instanceof DataView ||
    typeof value === "string"
  ) {
    return value;
  }

  // A null value is written out as an empty string to create an empty file.
  if (value === null) {
    return "";
  }

  // Explorable values are written out as JSON or, if the key ends in ".yaml",
  // as YAML.
  if (ExplorableGraph.canCastToExplorable(value)) {
    const graph = ExplorableGraph.from(value);
    return key.endsWith(".yaml")
      ? await ExplorableGraph.toYaml(graph)
      : await ExplorableGraph.toJson(graph);
  }

  // If the value is a plain JS object or array, write it out as JSON or YAML
  // (depending on the key), which seems like a more useful default than
  // "[object Object]" or the array contents.
  if (isPlainObject(value) || value instanceof Array) {
    return key.endsWith(".yaml")
      ? YAML.stringify(value)
      : JSON.stringify(value, null, 2);
  }

  // Otherwise, do our best to convert known types to a string.
  return String(toSerializable(value));
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

// Write out the indicated graph of source files/subfolders into the indicated
// target graph.
async function writeFiles(sourceGraph, targetGraph) {
  // Ensure the directory exists.
  await fs.mkdir(targetGraph.dirname, { recursive: true });

  // Start copying all the files, then wait for all of them to finish.
  const promises = [];
  for await (const key of sourceGraph) {
    const writePromise = copyFileWithKey(sourceGraph, targetGraph, key);
    promises.push(writePromise);
  }

  return Promise.all(promises);
}

// Copy the file with the indicated key from the source to the target.
async function copyFileWithKey(sourceGraph, targetGraph, key) {
  const value = await sourceGraph.get(key);
  await targetGraph.set(key, value);
}
