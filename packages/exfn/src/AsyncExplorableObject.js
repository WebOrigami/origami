import AsyncExplorable from "./AsyncExplorable.js";

export default class AsyncExplorableObject extends AsyncExplorable {
  /**
   * @param {any} source
   */
  constructor(source) {
    super();
    this.source = source;
  }

  /**
   * Return the value for the corresponding key.
   *
   * @param {any} key
   */
  async [AsyncExplorable.get](key) {
    // If source provides its own get method, prefer that to our default.
    const source = this.source;
    const value = source[AsyncExplorable.get]
      ? await source[AsyncExplorable.get](key)
      : source[key];
    return isPlainObject(value) ? new AsyncExplorableObject(value) : value;
  }

  async *[Symbol.asyncIterator]() {
    // If the source object provides its own asyncIterator, prefer that.
    const source = this.source;
    // @ts-ignore Remove ignore when TypeScript supports symbol indexers.
    yield* source[Symbol.asyncIterator]
      ? // @ts-ignore Remove ignore when TypeScript supports symbol indexers.
        source[Symbol.asyncIterator]()
      : Object.keys(source)[Symbol.iterator]();
  }
}

/**
 * Return true if the object is a plain JavaScript object.
 *
 * @param {any} obj
 */
export function isPlainObject(obj) {
  // From https://stackoverflow.com/q/51722354/76472
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}
