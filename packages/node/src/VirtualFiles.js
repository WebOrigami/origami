import { ExplorableGraph } from "@explorablegraph/core";
import path from "path";
// import Files from "./Files.js";

const virtualFileExtension = "←.js";

export default class VirtualFiles extends ExplorableGraph {
  constructor(inner) {
    super();
    this.inner = new ExplorableGraph(inner);
  }

  async *[Symbol.asyncIterator]() {
    // For virtual files, return virtual name instead of actual name.
    for await (const key of this.inner) {
      yield key.endsWith(virtualFileExtension)
        ? path.basename(key, virtualFileExtension)
        : key;
    }
  }

  async get(key, ...rest) {
    let value = await this.inner.get(key);

    if (value === undefined) {
      // Didn't find key; look for virtual key.
      // Exception: don't look if key is a special key of "." or "..".
      if (key !== "." && key !== "..") {
        const virtualKey = `${key}${virtualFileExtension}`;

        // Sadly, we can't import an arrow module via the graph, as the
        // JavaScript module syntax only works directly with file or web paths.
        const dirname = this.inner.dirname;
        const modulePath = path.join(dirname, virtualKey);
        const obj = await importModule(modulePath);
        if (obj) {
          // Successfully imported module; invoke its default export.
          const fn = obj.default;
          value = typeof fn === "function" ? await fn(this) : fn;
        }
      }
    }

    return value === undefined || rest.length === 0
      ? value
      : await value.get(...rest);
  }
}

async function importModule(modulePath) {
  let obj;
  try {
    obj = await import(modulePath);
  } catch (error) {
    if (error.code !== "ERR_MODULE_NOT_FOUND") {
      throw error;
    }
  }
  return obj;
}
