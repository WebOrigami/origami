import Graph from "./Graph.js";

export default class FunctionGraph extends Graph {
  constructor(functions) {
    super();
    this.functions = functions;
  }

  async get(key) {
    const fn = this.functions[key];
    const result = typeof fn === "function" ? await fn() : fn;
    return result;
  }

  [Symbol.asyncIterator]() {
    return Object.keys(this.functions)[Symbol.asyncIterator]();
  }
}
