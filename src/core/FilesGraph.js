import { watch } from "chokidar";
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import YAML from "yaml";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { incrementCount } from "../core/measure.js";
import {
  isPlainObject,
  sortNatural,
  toSerializable,
} from "../core/utilities.js";

const pathGraphMap = new Map();
const watcher = watch([], { ignoreInitial: true });
watcher.on("all", async (eventType, filePath) => {
  // Invoke onChange for graphs that contain the file path.
  for (const [dirname, graph] of pathGraphMap) {
    const relativePath = path.relative(dirname, filePath);
    if (!relativePath.startsWith("..")) {
      // Found -- graph contains this file as a descendant.
      // Traverse to the graph that actually contains this file.
      const keys = relativePath.split("/");
      const containerKeys = keys.slice(0, -1);
      const containerGraph =
        containerKeys.length > 0
          ? await ExplorableGraph.traverse(graph, ...containerKeys)
          : graph;
      if (containerGraph) {
        const fileKey = keys[keys.length - 1];
        // Let the container graph know the file with this key has changed.
        containerGraph.onChange(fileKey);
      }
    }
  }
});

export default class FilesGraph {
  constructor(dirname) {
    this.dirname = path.resolve(process.cwd(), dirname);
    this.subfoldersMap = new Map();
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
        this.subfoldersMap.set(key, subfolder);
      }
      return subfolder;
    }
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

  onChange(key) {
    // No-op
  }

  get path() {
    return this.dirname;
  }

  /**
   * Write the contents for the file named by the given key. If the value is
   * undefined, delete the file or directory.
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

  async unwatch() {
    watcher.unwatch(this.dirname);
    pathGraphMap.delete(this.dirname);
  }

  // Turn on watching for the directory.
  async watch() {
    // The directory may not exist yet, in which case the call to watch() will
    // throw ENOENT, so if we see ENOENT, we ignore the error.
    //
    // TODO: If set() eventually creates the directory, begin watching it.
    try {
      watcher.add(this.dirname);
      pathGraphMap.set(this.dirname, this);
    } catch (/** @type {any} */ error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
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
