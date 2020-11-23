import AsyncExplorable from "./AsyncExplorable.js";

export default class AsyncExplorableObject extends AsyncExplorable {
  /**
   * @param {any} source
   */
  constructor(source) {
    super();
    this.source = source;

    // If the source object provides its own call method, prefer that.
    // const callPropertyDescriptor = Object.getOwnPropertyDescriptor(
    //   source,
    //   call
    // );
    // this.callPropertyValue = callPropertyDescriptor?.value;
  }

  // TODO: Remove
  async [AsyncExplorable.asyncCall]() {}

  /**
   * Return the value for the corresponding key.
   *
   * @param {any} key
   */
  async [AsyncExplorable.asyncGet](key) {
    // Invoke object's own call method.
    // if (typeof this.callPropertyValue === "function") {
    //   // @ts-ignore REVIEW: Next line causes tsc 4.1.2 to crash!
    //   return this.callPropertyValue(key);
    // }
    const value = this.source[key];
    return isPlainObject(value) ? new AsyncExplorableObject(value) : value;
  }

  async *[Symbol.asyncIterator]() {
    // // If the source object provides its own asyncIterator, prefer that.
    // @ts-ignore Remove ignore when TypeScript supports symbol indexers.
    // if (this.source[Symbol.asyncIterator]) {
    //   // @ts-ignore Remove ignore when TypeScript supports symbol indexers.
    //   return this.source[Symbol.asyncIterator]();
    // }
    yield* Object.keys(this.source)[Symbol.iterator]();
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
