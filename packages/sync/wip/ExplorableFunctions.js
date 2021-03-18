import { asyncGet, asyncKeys, get, keys } from "@explorablegraph/symbols";
import ExplorableFunction from "./ExplorableFunction.js";

export default class ExplorableFunctions {
  constructor(functions, keys = []) {
    this.functions = functions;
    this.keys = keys;
  }

  async [asyncGet](...args) {
    return this[get](...args);
  }

  async *[asyncKeys]() {
    yield* this[keys]();
  }

  [get](fnName, ...args) {
    const fn = this.functions[fnName];
    const explorableFn = fn ? new ExplorableFunction(fn, this.keys) : undefined;
    if (explorableFn === undefined) {
      return undefined;
    } else if (args.length === 0) {
      return explorableFn;
    } else {
      return explorableFn[get](...args);
    }
  }

  [keys]() {
    return Object.keys(this.functions)[Symbol.iterator]();
  }
}
