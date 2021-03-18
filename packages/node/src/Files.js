import {
  AsyncExplorable,
  asyncGet,
  asyncKeys,
  asyncSet,
} from "@explorablegraph/core";
import { promises as fs } from "fs";
import path from "path";

export default class Files extends AsyncExplorable {
  constructor(dirname) {
    super();
    this.dirname = dirname;
  }

  async *[asyncKeys]() {
    let entries;
    try {
      entries = await fs.readdir(this.dirname, { withFileTypes: true });
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      entries = [];
    }
    const names = entries.map((entry) => entry.name);
    yield* names;
  }

  async [asyncGet](...keys) {
    // We can traverse the keys by joining them into a path.
    const objPath = path.join(this.dirname, ...keys);
    const stats = await stat(objPath);
    if (!stats) {
      return undefined;
    }
    const value = stats.isDirectory()
      ? Reflect.construct(this.constructor, [objPath])
      : await fs.readFile(objPath);
    return value;
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
  async [asyncSet](...args) {
    if (args.length === 0) {
      // No-op
      return;
    }
    const value = args.length === 1 ? undefined : args.pop();

    if (value === undefined) {
      // Delete file or directory.
      const objPath = path.join(this.dirname, ...args);
      const stats = await stat(objPath);
      if (stats?.isDirectory()) {
        // Delete directory.
        await fs.rmdir(objPath, { recursive: true });
      } else if (stats) {
        // Delete file.
        await fs.unlink(objPath);
      }
    } else if (value === null) {
      // Create directory.
      const folder = path.join(this.dirname, ...args);
      await fs.mkdir(folder, { recursive: true });
    } else if (value instanceof AsyncExplorable) {
      // Recursively write out the explorable object.
      for await (const subKey of value) {
        const subValue = await value[asyncGet](subKey);
        await this[asyncSet](...args, subKey, subValue);
      }
    } else {
      // Write out value as the contents of a file. The file name is the last
      // arg in the current set (we've already removed the value from the end of
      // the args). Args before the file name (if there are any) are the path
      // to the containing folder with this explorable Files tree.
      const filename = args.pop();

      // Ensure the containing folder exists.
      const folder = path.join(this.dirname, ...args);
      await fs.mkdir(folder, { recursive: true });

      // Write out the value as the file's contents.
      const filePath = path.join(folder, filename);
      await fs.writeFile(filePath, value);
    }
  }
}

// Return the file information for the file/folder at the given path.
// If it does not exist, return undefined.
async function stat(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    if (error.code === "ENOENT" /* File not found */) {
      return undefined;
    }
    throw error;
  }
}
