import * as fs from "fs/promises";
import path from "path";
import process from "process";
import YAML from "yaml";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { isPlainObject, toSerializable } from "../core/utilities.js";

export default class ExplorableFiles {
  constructor(dirname) {
    this.dirname = path.resolve(process.cwd(), dirname);
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
    // Use JavaScript sort order instead of OS sort order.
    names.sort();
    yield* names;
  }

  // We may have been given a path like foo/bar/baz containing multiple keys.
  // While we could turn that into a filesystem path and get the result in one
  // step, this would prevent the path from entering dynamic subgraphs created
  // by mixins/subclasses of this class. So we only process one key at a time;
  // if we get an explorable result, we have it handle the rest of the path.
  async get(key, ...rest) {
    if (key === undefined) {
      return this;
    }
    const objPath = path.resolve(this.dirname, key);
    const stats = await stat(objPath);
    if (!stats) {
      return undefined;
    }

    let result;
    if (stats.isDirectory()) {
      result = Reflect.construct(this.constructor, [objPath]);
    } else {
      result = fs.readFile(objPath);
    }

    result =
      rest.length > 0 && ExplorableGraph.isExplorable(result)
        ? await result.get(...rest)
        : result;

    return result;
  }

  get path() {
    return this.dirname;
  }

  /**
   * Write or overwrite the contents of a file at a given location in the graph.
   * Given a set of arguments, take the last argument as a value, and the ones
   * before it as a path. If only one argument is supplied, use that as a key,
   * and take the value as implicitly undefined.
   *
   * If the value is either explicitly or implicitly undefined, delete the file
   * or directory.
   *
   * @param  {...any} args
   */
  async set(...args) {
    if (args.length === 0) {
      // No-op
      return;
    }
    const value =
      args.length === 1 && !ExplorableGraph.isExplorable(args[0])
        ? undefined
        : args.pop();
    const lastKey = args[args.length - 1];

    if (value === undefined) {
      // Delete file or directory.
      const objPath = path.join(this.dirname, ...args);
      const stats = await stat(objPath);
      if (stats?.isDirectory()) {
        // Delete directory.
        await fs.rm(objPath, { recursive: true });
      } else if (stats) {
        // Delete file.
        await fs.unlink(objPath);
      }
    } else if (value === null) {
      // Create directory.
      const folder = path.join(this.dirname, ...args);
      await fs.mkdir(folder, { recursive: true });
    } else if (
      ExplorableGraph.isExplorable(value) &&
      !(lastKey?.endsWith(".json") || lastKey?.endsWith(".yaml"))
    ) {
      // Write out an explorable graph as a directory, and recusively write out
      // the graph into that directory. Don't do that if the filename ends in
      // .json or .yaml; in that case, let the next condition write out the
      // graph as a JSON or YAML file.
      for await (const subKey of value) {
        const subValue = await value.get(subKey);
        await this.set(...args, subKey, subValue);
      }
    } else {
      // Write out value as the contents of a file. The file name is the last
      // arg in the current set (we've already removed the value from the end of
      // the args). Args before the file name (if there are any) are the path
      // to the containing folder with this explorable ExplorableFiles tree.
      const filename = args.pop();

      // Ensure the containing folder exists.
      const folder = path.join(this.dirname, ...args);
      await fs.mkdir(folder, { recursive: true });

      // Convert the data to a form we can write to disk.
      const data = await prepareData(filename, value);

      // Write out the value as the file's contents.
      const filePath = path.join(folder, filename);
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

  // If the value is a plain JS object or array, write it out as JSON or YAML (depending on the key), which
  // seems like a more useful default than "[object Object]" or the array
  // contents.
  if (isPlainObject(value) || value instanceof Array) {
    return key.endsWith(".yaml")
      ? YAML.stringify(value)
      : JSON.stringify(value, null, 2);
  }

  // Explorable values are written out as JSON or, if the key ends in ".yaml",
  // as YAML.
  if (ExplorableGraph.canCastToExplorable(value)) {
    const graph = ExplorableGraph.from(value);
    return key.endsWith(".yaml")
      ? await ExplorableGraph.toYaml(graph)
      : await ExplorableGraph.toJson(graph);
  }

  // Otherwise, do our best to convert known types to a string.
  return toSerializable(value);
}

// Return the file information for the file/folder at the given path.
// If it does not exist, return undefined.
async function stat(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (/** @type {any} */ error) {
    if (error.code === "ENOENT" /* File not found */) {
      return undefined;
    }
    throw error;
  }
}
