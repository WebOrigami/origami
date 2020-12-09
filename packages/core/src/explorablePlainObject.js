import {
  asyncGet,
  asyncKeys,
  asyncSet,
  get,
  keys,
  set,
} from "@explorablegraph/symbols";
import { isPlainObject } from "./builtIns.js";
import Explorable from "./Explorable.js";

export default function explorablePlainObject(obj) {
  const explorable = {
    // Default `[asyncGet]` invokes `[get]`.
    // @ts-ignore
    async [asyncGet](...keys) {
      return this[get](...keys);
    },

    // Default `[asyncKeys]` invokes `[keys]`.
    // @ts-ignore
    async *[asyncKeys]() {
      yield* this[keys]();
    },

    // Default `[asyncSet]` invokes `[set]`.
    // @ts-ignore
    async [asyncSet](...args) {
      return this[set](...args);
    },

    /**
     * Return the value at the corresponding path of keys.
     *
     * @param {...any} keys
     */
    [get](...keys) {
      const obj = Object.getPrototypeOf(this);

      // If source object provides its own get method, use that.
      if (obj[get]) {
        return obj[get](...keys);
      }

      // Traverse the keys.
      let value = this;
      while (value !== undefined && keys.length > 0) {
        const key = keys.shift();
        // The key might be on this object -- an extension of obj -- or on the
        // original obj.
        value = value[key];

        if (value instanceof Explorable && keys.length > 0) {
          return value[get](...keys);
        }

        // HACK: Move this to another class
        if (value instanceof Function) {
          // Invoke function
          return value(...keys);
        }
      }

      return keys.length > 0
        ? undefined
        : isPlainObject(value)
        ? explorablePlainObject(value)
        : value;
    },

    /**
     * Add or overwrite the value at a given location in the graph. Given a set
     * of arguments, take the last argument as a value, and the ones before it
     * as a path. If only one argument is supplied, use that as a key, and take
     * the value as undefined.
     *
     * @param  {...any} args
     */
    [set](...args) {
      if (args.length === 0) {
        // No-op
        return;
      }
      const value = args.length === 1 ? undefined : args.pop();
      const keys = args;

      // Traverse the keys
      let current = obj;
      while (keys.length > 1) {
        const key = keys.shift();
        let next = current[key];
        if (!isPlainObject(next)) {
          // Overwrite path
          next = {};
          current[key] = next;
        }
        current = next;
      }

      const key = keys.shift();
      if (value === undefined) {
        delete current[key];
      } else {
        current[key] = value;
      }
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
