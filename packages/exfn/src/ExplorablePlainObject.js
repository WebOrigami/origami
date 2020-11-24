import { get, keys } from "@explorablegraph/symbols";
import Explorable from "./Explorable.js";

export default class ExplorablePlainObject extends Explorable {
  /**
   * @param {any} obj
   */
  constructor(obj) {
    super();
    this.obj = obj;
  }

  /**
   * Return the value for the corresponding key.
   *
   * @param {any} key
   */
  [get](key) {
    // If source object provides its own get method, prefer that to our default.
    const obj = this.obj;
    const value = obj[get] ? obj[get](key) : obj[key];
    return isPlainObject(value) ? new ExplorablePlainObject(value) : value;
  }

  // @ts-ignore
  [keys]() {
    // If the source object provides its own iterator, prefer that.
    const obj = this.obj;
    // @ts-ignore Remove ignore when TypeScript supports symbol indexers.
    return obj[keys]
      ? // @ts-ignore Remove ignore when TypeScript supports symbol indexers.
        obj[keys]()
      : Object.keys(obj)[Symbol.iterator]();
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
