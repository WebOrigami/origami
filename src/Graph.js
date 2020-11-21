const isGraphSymbol = Symbol("Graph.isGraph");

export default class Graph {
  // Default implementation returns an empty array.
  [Symbol.iterator]() {
    return [];
  }

  /**
   * Return the graph as a flat object, with all promises resolved.
   * TODO: This method should probably be called resolve(), and the existing
   * resolving command renamed.
   */
  async await() {
    return await this.reduce(async (obj) => await obj);
  }

  // Default implementation returns undefined.
  async get(key) {
    return undefined;
  }

  // Static getter used by Graph itself and other classes to define the class
  // instance method.
  static get isGraph() {
    return isGraphSymbol;
  }

  // Returns true, indicating the object is a graph.
  // Note that we can't use Graph.isGraph to define Graph's own instance getter,
  // since the class isn't defined at this point.
  get [isGraphSymbol]() {
    return true;
  }

  /**
   * Returns the keys a graph.
   */
  static async keys(graph) {
    const result = [];
    for await (const key of graph) {
      result.push(key);
    }
    return result;
  }

  async keys() {
    return await Graph.keys(this);
  }

  static async reduce(graph, callback) {
    const result = {};
    for await (const key of graph) {
      const obj = await graph.get(key);
      result[key] = obj[Graph.isGraph]
        ? // Recurse
          await obj.reduce(callback)
        : await callback(obj);
    }
    return result;
  }

  // TODO: Use a visitor pattern to avoid loops.
  async reduce(callback) {
    return await Graph.reduce(this, callback);
  }

  /**
   * Return the graph as a flat object, with all async subgraphs resolved to
   * subobjects.
   */
  async resolve() {
    return await this.reduce((obj) => obj);
  }

  /**
   * Return the resolved graph, with all regular nodes in string form.
   */
  async resolveText() {
    // Return string representation of each non-graph object.
    return await this.reduce((obj) => String(obj));
  }

  static from(obj) {
    return obj[Graph.isGraph] ? obj : new ObjectGraph(obj);
  }

  /**
   * Follow the edges in the graph named by the array of keys.
   *
   * @param {string[]} keys
   */
  async traverse(keys) {
    const [key, ...rest] = keys;
    const obj = await this.get(key);
    if (rest.length === 0) {
      // Finished traversing; return the object.
      return obj;
    } else if (obj[Graph.isGraph]) {
      // Traverse into the graph.
      return await obj.traverse(rest);
    } else {
      // Not found.
      return undefined;
    }
  }
}

// We define ObjectGraph here so that Graph.toGraph can reference it
// without creating a cycle in the JavaScript module dependency graph.
export class ObjectGraph extends Graph {
  constructor(source) {
    super();
    this.source = source;

    // If the source object provides its own get method, prefer that.
    const getDescriptor = Object.getOwnPropertyDescriptor(source, "get");
    const value = getDescriptor?.value;
    if (typeof value === "function") {
      this.get = value;
    }
  }

  get(key) {
    const obj = this.source[key];
    return isPlainObject(obj) ? new ObjectGraph(obj) : obj;
  }

  [Symbol.asyncIterator]() {
    // If the source object provides its own asyncIterator, prefer that.
    return this.source[Symbol.asyncIterator]
      ? this.source[Symbol.asyncIterator]()
      : Object.keys(this.source)[Symbol.iterator]();
  }
}

// From https://stackoverflow.com/q/51722354/76472
export function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}
