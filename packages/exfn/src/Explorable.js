import { asyncGet, asyncKeys, get, keys } from "@explorablegraph/symbols";
import AsyncExplorable from "./AsyncExplorable.js";
import {
  default as ExplorablePlainObject,
  isPlainObject,
} from "./ExplorablePlainObject.js";
import * as syncOps from "./syncOps.js";

// Use function syntax to define constructor so that we can support calling the
// constructor directly without `new` as a means of implicit conversion of
// objects to exfns. The TypeScript handling here needs tightening.

// @ts-ignore
export default function Explorable(obj) {
  if (!new.target) {
    // Constructor called as function without `new`.
    const constructor = this || Explorable;
    return new constructor(obj);
  } else if (obj instanceof Explorable) {
    // Object is already explorable; return as is.
    return obj;
  } else if (isPlainObject(obj)) {
    return new ExplorablePlainObject(obj);
  }
}

// Inherit from AsyncExplorable
Explorable.prototype = Object.create(AsyncExplorable.prototype);
Object.defineProperty(Explorable.prototype, "constructor", {
  value: Explorable,
  enumerable: false,
  writable: true,
});

// See AsyncExplorable regarding hasInstance
Object.defineProperty(Explorable, Symbol.hasInstance, {
  value: (obj) =>
    obj && ((obj[get] && obj[keys]) || obj instanceof AsyncExplorable),
});

//
// Instance methods
//

// Default `[asyncGet]` invokes `[get]`.
Explorable.prototype[asyncGet] = async function (key) {
  return this[get](key);
};

// Default `[asyncKeys]` invokes `[keys]`.
// @ts-ignore
Explorable.prototype[asyncKeys] = function* () {
  yield* this[keys]();
};

// Default `[get]` implementation returns undefined for any key.
Explorable.prototype[get] = function (key) {
  return undefined;
};

// Default `[keys]` implementation returns an iterator for an empty list.
Explorable.prototype[keys] = function* () {
  yield* [];
};

// Default `toString` implementation returns pretty-printed JSON. Note: this
// pretty `toString` representation will *not* be available to exfns that define
// the sync exfn symbols but do not inherit from Explorable. Such exfns will
// still have `toString` defined for them (defined by the Object base class),
// but the string representation will be something else (usually "[object
// Object]").
Explorable.prototype.toString = function () {
  const plain = syncOps.plain(this);
  return JSON.stringify(plain, null, 2);
};

//
// Static methods
//

/**
 * Returns the keys for a sync explorable.
 *
 * @param {any} exfn
 */
Explorable.keys = function (exfn) {
  return [...exfn];
};
