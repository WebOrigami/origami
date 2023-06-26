import { GraphHelpers } from "@graphorigami/core";
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import YAML from "yaml";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { incrementCount } from "../core/measure.js";
import {
  isPlainObject,
  sortNatural,
  toSerializable,
} from "../core/utilities.js";

// List of OS-generated files that should not be enumerated
const hiddenFileNames = {
  ".DS_Store": true,
};

export default class FilesGraph extends EventTarget {
  /**
   * Create a new `FilesGraph` rooted at the given directory.
   *
   * @param {string} dirname the root directory. If this is not an absolute
   * path, this is resolved relative to the current working directory.
   */
  constructor(dirname) {
    super();

    this.dirname = path.resolve(process.cwd(), dirname);
    this.basename = path.basename(this.dirname);

    // Map of subfolder names to subfolder graphs.
    this.subfoldersMap = new Map();

    // Don't watch unless explicitly requested.
    this.watching = false;
  }

  /**
   * Get the contents of the file or directory named by the given key.
   *
   * @param {string} key
   */
  async get(key) {
    incrementCount("FilesGraph get");

    // We define get(undefined) to be the graph itself. This lets an ori command
    // like "ori folder/" with a trailing slash be equivalent to "ori folder".
    if (key === undefined) {
      return this;
    }

    const objPath = path.resolve(this.dirname, String(key));
    const stats = await stat(objPath);
    if (!stats) {
      return undefined;
    } else if (!stats.isDirectory()) {
      // Return file
      return fs.readFile(objPath);
    } else {
      let subfolder = this.subfoldersMap.get(key);
      if (!subfolder) {
        // Haven't seen this subfolder before.
        subfolder = Reflect.construct(this.constructor, [objPath]);
        // If we're watching the current directory, watch the subfolder too.
        // if (this.watching) {
        //   await subfolder.watch();
        // }
        // Remember this subfolder for later requests.
        this.subfoldersMap.set(key, subfolder);
      }
      return subfolder;
    }
  }

  async isKeyExplorable(key) {
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

    const names = entries.map((entry) => entry.name);

    // Filter out unhelpful file names.
    const filtered = names.filter((name) => !hiddenFileNames[name]);

    // Node fs.readdir sort order appears to be unreliable; see, e.g.,
    // https://github.com/nodejs/node/issues/3232. That seems unhelpful for many
    // applications. Since it's quite common for file names to include numbers,
    // we use natural sort order: ["file1", "file9", "file10"] instead of
    // ["file1", "file10", "file9"].
    const sorted = sortNatural(filtered);
    return sorted;
  }

  get path() {
    return this.dirname;
  }

  /**
   * Write the contents for the file named by the given key. If the value is
   * explorable, then write out its values as files in a subdirectory. If the
   * value is undefined, delete the file or directory.
   *
   * @param {any} key
   * @param {any} value
   */
  async set(key, value) {
    const escaped = escapeKey(key);
    const objPath = path.join(this.dirname, escaped);
    if (value === undefined) {
      // Delete file or directory.
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
      !(escaped?.endsWith(".json") || escaped?.endsWith(".yaml"))
    ) {
      // Write the explorable's values into the subfolder named by the key.
      // However, if the key ends in .json or .yaml, let the next condition
      // write out the graph as a JSON/YAML file.
      const targetGraph = Reflect.construct(this.constructor, [objPath]);
      await writeFiles(value, targetGraph);
    } else {
      // Ensure the directory exists.
      await fs.mkdir(this.dirname, { recursive: true });

      // Write out the value as the contents of a file.
      const data = await prepareData(escaped, value);
      await fs.writeFile(objPath, data);
    }
  }
}

// Copy the file with the indicated key from the source to the target.
async function copyFileWithKey(sourceGraph, targetGraph, key) {
  const value = await sourceGraph.get(key);
  await targetGraph.set(key, value);
}

function escapeKey(key) {
  let keyText = key.toString();
  const escaped = keyText.replaceAll("/", "%");
  return escaped;
}

// Determine the form in which we want to write the data to disk under the given
// key.
async function prepareData(key, value) {
  // If the value is already serializable, return it as is.
  if (
    typeof value === "string" ||
    value instanceof String ||
    value instanceof Buffer ||
    value instanceof Uint8Array ||
    value instanceof DataView
  ) {
    return value;
  }

  // A null value is written out as an empty string to create an empty file.
  if (value === null) {
    return "";
  }

  // Explorable graphs are written out as JSON or, if the key ends in ".yaml",
  // as YAML.
  if (ExplorableGraph.canCastToExplorable(value)) {
    const graph = GraphHelpers.from(value);
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
  for (const key of await sourceGraph.keys()) {
    const writePromise = copyFileWithKey(sourceGraph, targetGraph, key);
    promises.push(writePromise);
  }

  return Promise.all(promises);
}
