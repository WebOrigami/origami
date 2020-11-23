// import {
//   default as ExplorableObject,
//   isPlainObject,
// } from "./ExplorableObject.js";
import { call as callSymbol } from "./symbols.js";

export const call = callSymbol;

export default class Explorable {
  /**
   * Invoke an explorable object as a function.
   *
   * @param {any} obj
   * @param  {...any} args
   * @returns {any}
   */
  static call(obj, ...args) {
    return (
      // Explorable object or
      obj[call]?.(...args) ??
      // Assumed to be a function.
      obj(...args)
    );
  }

  /**
   * Return true if the given object is explorable.
   *
   * @param {any} obj
   * @returns {boolean}
   */
  static isExplorable(obj) {
    const isCallable = Boolean(obj[call]) || typeof obj === "function";
    const hasIterator = Boolean(obj[Symbol.asyncIterator]);
    return isCallable && hasIterator;
  }

  /**
   * Create an explorable reference to the given object.
   *
   * If the object is already explorable, this returns the object itself.
   * If the object is a plain JavaScript object, this returns a new instance
   * of ExplorableObject backed by the object.
   *
   * Otherwise this throws a TypeError.
   *
   * @param {any} obj
   */
  // static from(obj) {
  //   if (Explorable.isExplorable(obj)) {
  //     return obj;
  //   } else if (isPlainObject(obj)) {
  //     return new ExplorableObject(obj);
  //   }
  //   throw new TypeError(
  //     "Explorable.from was given an object that cannot be made explorable."
  //   );
  // }

  /**
   * Returns the keys for an explorable.
   *
   * @param {any} explorable
   */
  // static async keys(explorable) {
  //   const result = [];
  //   for await (const key of explorable) {
  //     result.push(key);
  //   }
  //   return result;
  // }

  /**
   * Collapse a graph.
   *
   * Working from the leaves toward the root, for each explorable node,
   * apply the callback to the enumerated values and return the result,
   * collapsing down to the root.
   *
   * @param {any} explorable
   * @param {function} callback
   */
  // static async collapse(explorable, callback) {
  //   const values = [];
  //   for await (const key of explorable) {
  //     const obj = await Explorable.call(explorable, key);
  //     /** @type {any} */
  //     const collapsed = Explorable.isExplorable(obj)
  //       ? await this.collapse(obj, callback)
  //       : obj;
  //     values.push(collapsed);
  //   }
  //   const result = await callback(...values);
  //   return result;
  // }

  /**
   *
   * @param {any} explorable
   * @param {function} callback
   */
  // static async reduce(explorable, callback) {
  //   const map = {};
  //   for await (const key of explorable) {
  //     const obj = await Explorable.call(explorable, key);
  //     /** @type {any} */
  //     const value = Explorable.isExplorable(obj)
  //       ? await this.reduce(obj, callback)
  //       : obj;
  //     // @ts-ignore
  //     map[key] = value;
  //   }
  //   const result = await callback(map);
  //   return result;
  // }

  /**
   * Returns the flat set of values for an explorable.
   *
   * @param {any} explorable
   */
  // static async values(explorable) {
  //   const result = [];
  //   for await (const key of explorable) {
  //     const value = await Explorable.call(explorable, key);
  //     result.push(value);
  //   }
  //   return result;
  // }
}
