import path from "path";
import { ExplorableGraph } from "../../core/exports.js";

const virtualFileExtension = "←.js";

export default class VirtualFiles extends ExplorableGraph {
  // TODO: type-check that inner has path property
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
    let value = await this.inner.get(key, ...rest);

    if (value !== undefined) {
      return value;
    }

    // Special keys "." and ".." can't be used for virtual files.
    if (key === "." || key === "..") {
      return undefined;
    }

    // Didn't find the expected value; try a virtual key.
    const virtualKey = `${key}${virtualFileExtension}`;
    // We can't obtain the module via `get`, as the JavaScript module syntax
    // only works directly with file or web paths.
    const modulePath = path.join(this.path, virtualKey);
    const obj = await importModule(modulePath);
    if (obj) {
      // Successfully imported module; return its default export.
      const moduleDefault = obj.default;

      // If result is a function, bind it to this graph.
      value =
        moduleDefault instanceof Function
          ? moduleDefault.bind(this)
          : moduleDefault;
    }

    return this.resolve(value, rest);
  }

  get path() {
    return this.inner.path;
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
