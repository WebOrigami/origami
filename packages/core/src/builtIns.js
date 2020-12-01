import { asyncGet, asyncKeys, get, keys } from "@explorablegraph/symbols";
import AsyncExplorable from "./AsyncExplorable.js";
import Explorable from "./Explorable.js";
import explorablePlainObject from "./explorablePlainObject.js";

/**
 * Create an async-explorable version of the given built-in JavaScript object.
 * If the object is not one that can be made explorable, this returns null.
 *
 * @param {any} obj
 */
export function asyncExplorable(obj) {
  if (obj instanceof AsyncExplorable) {
    // Already async explorable
    return obj;
  } else {
    // Create sync explorable version.
    const exfn = explorable(obj);
    if (exfn) {
      Object.assign(exfn, {
        // Default `[asyncGet]` invokes `[get]`.
        async [asyncGet](...keys) {
          return this[get](...keys);
        },

        // Default `[asyncKeys]` invokes `[keys]`.
        async *[asyncKeys]() {
          yield* this[keys]();
        },
      });
    }
    return exfn;
  }
}

/**
 * Create an explorable version of the given built-in JavaScript object.
 * If the object is not one that can be made explorable, this returns null.
 *
 * @param {any} obj
 */
export function explorable(obj) {
  if (obj instanceof Explorable) {
    // Already sync explorable
    return obj;
  } else if (isPlainObject(obj)) {
    return explorablePlainObject(obj);
  } else {
    return null;
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
