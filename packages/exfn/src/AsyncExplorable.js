import { asyncGet, asyncKeys } from "@explorablegraph/symbols";
import {
  default as ExplorablePlainObject,
  isPlainObject,
} from "./ExplorablePlainObject.js";

// Use function syntax to define constructor so that we can support calling the
// constructor directly without `new` as a means of implicit conversion of
// objects to exfns. The TypeScript handling here needs tightening.

// @ts-ignore
export default function AsyncExplorable(obj) {
  if (isPlainObject(obj)) {
    return new ExplorablePlainObject(obj);
    // @ts-ignore
  } else if (this instanceof AsyncExplorable) {
    // @ts-ignore
    return this;
  } else {
    return new AsyncExplorable();
  }
}

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

/**
 * Return true if the given object is async explorable.
 *
 * @param {any} obj
 * @returns {boolean}
 */
AsyncExplorable.isExplorable = function (obj) {
  return !!obj[asyncGet] && !!obj[asyncKeys];
};
