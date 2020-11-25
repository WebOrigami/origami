import { asyncGet, asyncKeys, get, keys } from "@explorablegraph/symbols";
import {
  default as ExplorablePlainObject,
  isPlainObject,
} from "./ExplorablePlainObject.js";

// Use function syntax to define constructor so that we can support calling the
// constructor directly without `new` as a means of implicit conversion of
// objects to exfns. The TypeScript handling here needs tightening.

// @ts-ignore
export default function Explorable(obj) {
  if (isPlainObject(obj)) {
    return new ExplorablePlainObject(obj);
    // @ts-ignore
  } else if (this instanceof Explorable) {
    // @ts-ignore
    return this;
  } else {
    return new Explorable();
  }
}

//
// Instance methods
//

// Default `[asyncGet]` just invokes `[get]`.
Explorable.prototype[asyncGet] = async function (key) {
  return this[get](key);
};

// Default `[asyncKeys]` just invokes `[keys]`.
Explorable.prototype[asyncKeys] = async function* () {
  yield* this[keys]();
};

// Default `[get]` implementation returns undefined for any key.
Explorable.prototype[get] = function (key) {
  return undefined;
};

// Default `[keys]` implementation returns an iterator for an empty list.
Explorable.prototype[keys] = function () {
  return [][Symbol.iterator]();
};

//
// Static methods
//

/**
 * Return true if the given object is explorable.
 *
 * @param {any} obj
 * @returns {boolean}
 */
Explorable.isExplorable = function (obj) {
  return !!obj[get] && !!obj[keys];
};

/**
 * Returns the keys for a sync explorable.
 *
 * @param {any} exfn
 */
Explorable.keys = function (exfn) {
  return [...exfn];
};
