import {
  AsyncMap,
  handleDotKey,
  naturalOrder,
  resolveChildPath,
  setParent,
  trailingSlash,
} from "@weborigami/async-tree";
import { symbols } from "@weborigami/language";
import path from "node:path";

/**
 * Map driver for an SFTP server path
 */
export default class SftpMap extends AsyncMap {
  constructor(options) {
    super();

    this.client = options.client;
    this.path = options.path ? trailingSlash.add(options.path) : "";
  }

  async child(key) {
    const childPath = resolveChildPath(this.path, key);

    const existingChild = await this.get(key);
    if (existingChild) {
      if (existingChild instanceof SftpMap) {
        return existingChild;
      } else {
        // A file exists with the desired directory name; delete it
        await this.delete(key);
      }
    }

    // Create the directory on the SFTP server
    await this.client.mkdir(childPath);

    // Return an SftpMap for the new directory
    const child = Reflect.construct(this.constructor, [
      {
        client: this.client,
        path: childPath,
      },
    ]);
    child.parent = this;
    return child;
  }

  async delete(key) {
    const childPath = resolveChildPath(this.path, key);

    if (trailingSlash.has(childPath)) {
      // Trailing slash: delete the directory
      try {
        await this.client.rmdir(childPath, true);
      } catch (/** @type {any} */ error) {
        if (error.code === 2) {
          // No such file: nothing to delete
          return false;
        }
        throw error;
      }
      return true;
    }

    try {
      await this.client.unlink(childPath);
    } catch (/** @type {any} */ error) {
      const { code } = error;
      if (code === 2) {
        // No such file: nothing to delete
        return false;
      } else if (code === 3) {
        // Permission denied: probably a directory, try deleting it
        await this.client.rmdir(childPath, true);
      } else {
        throw error;
      }
    }

    return true;
  }

  async get(key) {
    let value = handleDotKey(this, key);
    if (value) {
      return value;
    }

    const valuePath = resolveChildPath(this.path, key);
    if (trailingSlash.has(valuePath)) {
      // Trailing slash: return a new SftpMap immediately
      value = Reflect.construct(this.constructor, [
        {
          client: this.client,
          path: valuePath,
        },
      ]);
    } else {
      // File
      try {
        value = await this.client.get(valuePath);
      } catch (/** @type {any} */ error) {
        const { code } = error;
        if (code === 2) {
          // File not found
          return undefined;
        } else if (code === 4) {
          // Asked for a file but it's a directory
          value = Reflect.construct(this.constructor, [
            {
              client: this.client,
              path: valuePath,
            },
          ]);
        } else {
          // Some other error
          throw error;
        }
      }
    }

    setParent(value, this);

    return value;
  }

  async *keys() {
    const list = await this.client.readdir(this.path);
    const keys = list.map((item) =>
      trailingSlash.toggle(item.filename, item.attrs.isDirectory()),
    );
    keys.sort(naturalOrder);
    yield* keys;
  }

  [symbols.noCacheSymbol] = true;

  async set(key, value) {
    const childPath = resolveChildPath(this.path, key);

    // Ensure the target directory exists
    const parentPath = path.dirname(childPath);
    await this.client.mkdir(parentPath);

    if (!(value instanceof Buffer)) {
      // Pack as a Node Buffer because that's what the SFTP client expects, and
      // also to avoid having a string value interpreted as a local file path.
      value = Buffer.from(value);
    }
    await this.client.put(value, childPath);

    return this;
  }

  trailingSlashKeys = true;
}
