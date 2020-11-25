import { asyncGet, asyncKeys } from "@explorablegraph/symbols";
import * as asyncOps from "./asyncOps.js";
import {
  default as ExplorablePlainObject,
  isPlainObject,
} from "./ExplorablePlainObject.js";

// Use function syntax to define constructor so that we can support calling the
// constructor directly without `new` as a means of implicit conversion of
// objects to exfns. The TypeScript handling here needs tightening.

// @ts-ignore
export default function AsyncExplorable(obj) {
  if (!new.target) {
    // Constructor called as function without `new`.
    const constructor = this || AsyncExplorable;
    return new constructor(obj);
  } else if (obj && AsyncExplorable.isExplorable(obj)) {
    // Object is already explorable; return as is.
    return obj;
  } else if (isPlainObject(obj)) {
    return new ExplorablePlainObject(obj);
  }
}

// Defining a class as a function in the way above runs into issues when
// defining subclasses of subclasses -- they will fail to pass an `instanceof`
// test. We define [Symbol.hasInstance] so that we'll be asked whether an
// object is an AsyncExplorable.
//
// For now, we return true if the object passes the async exfn test. However,
// that may lead to confusion where someone creates their own exfn using symbols
// and not the AsyncExplorable constructor, but is surprised to see that their
// exfn returns true for `instanceof AsyncExplorable`.
//
// Another solution would be to walk up the prototype chain to see if it
// includes AsyncExplorable. That's presumably what the native `instanceof`
// implementation does -- but the native implementation is probably heavily
// optimized.
Object.defineProperty(AsyncExplorable, Symbol.hasInstance, {
  value: (obj) => {
    return AsyncExplorable.isExplorable(obj);
  },
});

//
// Instance methods
//

// Default `[asyncKeys]` implementation returns an iterator for an empty list.
AsyncExplorable.prototype[asyncKeys] = async function* () {
  yield* [];
};

// Default `[asyncGet]` implementation returns undefined for any key.
AsyncExplorable.prototype[asyncGet] = async function (key) {
  return undefined;
};

//
// Static methods
//

// Expose all async ops on `asyncOps` property.
AsyncExplorable.asyncOps = asyncOps;

/**
 * Return true if the given object is async explorable.
 *
 * @param {any} obj
 * @returns {boolean}
 */
AsyncExplorable.isExplorable = function (obj) {
  return !!obj[asyncGet] && !!obj[asyncKeys];
};
