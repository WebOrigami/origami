import { asyncCall, asyncGet, call, get } from "../src/symbols.js";

export default class Explorable {
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

// Expose the symbols on the Explorable class.
Object.assign(Explorable, { call, asyncCall, get, asyncGet });
