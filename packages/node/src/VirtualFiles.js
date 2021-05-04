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
    let value = await this.inner.get(key);

    if (value instanceof ExplorableGraph) {
      value = Reflect.construct(this.constructor, [value]);
    }

    // If we didn't find the value; try a virtual key.
    // Exception: don't look if key is a special key of "." or "..".
    if (value === undefined && key !== "." && key !== "..") {
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
    }

    return rest.length > 0 && value instanceof ExplorableGraph
      ? await value.get(...rest)
      : value;
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
