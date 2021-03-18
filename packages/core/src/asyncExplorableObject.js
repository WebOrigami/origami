import { asyncGet, asyncKeys, asyncSet } from "@explorablegraph/symbols";
import AsyncExplorable from "./AsyncExplorable.js";
import { isPlainObject } from "./builtIns.js";

export default function asyncExplorableObject(obj) {
  const asyncExplorable = {
    // We define [Symbol.asyncIterator] so TypeScript knows it's there, even
    // though it's the same as the [asyncKeys].
    async *[Symbol.asyncIterator]() {},

    /**
     * Return the value at the corresponding path of keys.
     *
     * @param {...any} keys
     */
    async [asyncGet](...keys) {
      const obj = Object.getPrototypeOf(this);

      // If source object provides its own asyncGet method, use that.
      if (obj[asyncGet]) {
        return obj[asyncGet](...keys);
      }

      // Traverse the keys.
      let value = this;
      while (value !== undefined && keys.length > 0) {
        const key = keys.shift();
        // The key might be on this object -- an extension of obj -- or on the
        // original obj.
        value = value[key];

        if (value instanceof AsyncExplorable && keys.length > 0) {
          return value[asyncGet](...keys);
        }
      }

      return keys.length > 0
        ? undefined
        : isPlainObject(value)
        ? asyncExplorableObject(value)
        : value;
    },

    // @ts-ignore
    async *[asyncKeys]() {
      const obj = Object.getPrototypeOf(this);
      // If the source object provides its own iterator, prefer that.
      // @ts-ignore Remove ignore when TypeScript supports symbol indexers.
      if (obj[asyncKeys]) {
        // @ts-ignore Remove ignore when TypeScript supports symbol indexers.
        yield* obj[asyncKeys]();
      } else {
        // Keys will be keys on this object -- an extension of obj -- as will
        // those on the original obj itself. Because both objects might define
        // the same keys, we use a Set to get the unique keys.
        const keySet = new Set([...Object.keys(obj), ...Object.keys(this)]);
        yield* keySet[Symbol.iterator]();
      }
    },

    /**
     * Add or overwrite the value at a given location in the graph. Given a set
     * of arguments, take the last argument as a value, and the ones before it
     * as a path. If only one argument is supplied, use that as a key, and take
     * the value as undefined.
     *
     * @param  {...any} args
     */
    async [asyncSet](...args) {
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
  };

  Object.setPrototypeOf(asyncExplorable, obj);
  return asyncExplorable;
}
