import { asyncGet, asyncKeys, get, keys } from "@explorablegraph/symbols";

export default class ExplorableFunction {
  constructor(fn, keys) {
    this.fn = fn;
    this.keys = keys;
  }

  async [asyncGet](...args) {
    return this[get](...args);
  }

  async *[asyncKeys]() {
    yield* this[keys]();
  }

  [get](...args) {
    const result = this.fn(...args);
    return result;
  }

  [keys]() {
    return this.keys[Symbol.iterator]();
  }
}
