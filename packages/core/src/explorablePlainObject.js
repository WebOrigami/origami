import { asyncGet, asyncKeys, get, keys } from "@explorablegraph/symbols";
import { isPlainObject } from "./builtIns.js";

export default function explorablePlainObject(obj) {
  const explorable = {
    // Default `[asyncGet]` invokes `[get]`.
    async [asyncGet](key) {
      return this[get](key);
    },

    // Default `[asyncKeys]` invokes `[keys]`.
    // @ts-ignore
    async *[asyncKeys]() {
      yield* this[keys]();
    },

    /**
     * Return the value for the corresponding key.
     *
     * @param {any} key
     */
    [get](key) {
      const obj = Object.getPrototypeOf(this);
      // If source object provides its own get method, prefer that to our
      // default. Also note that the value might be on this object -- an
      // extension of obj -- or on the original obj.
      const value = obj[get] ? obj[get](key) : this[key] || obj[key];
      return isPlainObject(value) ? explorablePlainObject(value) : value;
    },

    // @ts-ignore
    [keys]() {
      const obj = Object.getPrototypeOf(this);
      // If the source object provides its own iterator, prefer that.
      // @ts-ignore Remove ignore when TypeScript supports symbol indexers.
      if (obj[keys]) {
        // @ts-ignore Remove ignore when TypeScript supports symbol indexers.
        return obj[keys]();
      } else {
        // Keys will be keys on this object -- an extension of obj -- as will
        // those on the original obj itself. Because both objects might define
        // the same keys, we use a Set to get the unique keys.
        const keySet = new Set([...Object.keys(obj), ...Object.keys(this)]);
        return keySet[Symbol.iterator]();
      }
    },
  };
  Object.setPrototypeOf(explorable, obj);
  return explorable;
}
