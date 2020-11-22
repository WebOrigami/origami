import { call } from "./symbols.js";

export default class ExplorableObject {
  constructor(source) {
    this.source = source;

    // If the source object provides its own call method, prefer that.
    const callDescriptor = Object.getOwnPropertyDescriptor(source, call);
    const value = callDescriptor?.value;
    if (typeof value === "function") {
      this[call] = (...args) => this[call](...args);
    }

    // If the source object provides its own iterator, prefer that.
    if (this.source[Symbol.iterator]) {
      this[Symbol.asyncIterator] = this.source[Symbol.iterator];
    }
  }

  [call](key) {
    const value = this.source[key];
    return isPlainObject(value) ? new ExplorableObject(value) : value;
  }

  [Symbol.asyncIterator]() {
    return Object.keys(this.source)[Symbol.iterator]();
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
