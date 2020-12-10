import { asyncGet, asyncKeys, get, keys } from "@explorablegraph/symbols";

export default class ExplorableFunctions {
  constructor(functions, keys = []) {
    this.functions = functions;
    this.keys = keys;
  }

  async [asyncGet](...args) {
    return this[get](...args);
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

  async *[asyncKeys]() {
    yield* this[keys]();
  }

  [keys]() {
    return Object.keys(this.functions)[Symbol.iterator]();
  }
}

// TODO: Expose as separate class.
class ExplorableFunction {
  constructor(fn, keys) {
    this.fn = fn;
    this.keys = keys;
  }

  [get](...args) {
    const result = this.fn(...args);
    return result;
  }

  [keys]() {
    return this.keys[Symbol.iterator]();
  }
}
