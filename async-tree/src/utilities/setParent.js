import isMap from "../operations/isMap.js";
import * as symbols from "../symbols.js";

/**
 * If the child object doesn't have a parent yet, set it to the indicated
 * parent. If the child is a map, set the `parent` property. Otherwise,
 * set the `symbols.parent` property.
 *
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @param {*} child
 * @param {any} parent
 */
export default function setParent(child, parent) {
  if (isMap(child)) {
    // Value is a subtree; set its parent to this tree.
    if ("parent" in child && !child.parent) {
      /** @type {any} */ (child).parent = parent;
    }
  } else if (Object.isExtensible(child) && !child[symbols.parent]) {
    try {
      // Add parent reference as a symbol to avoid polluting the object. This
      // reference will be used if the object is later used as a tree. We set
      // `enumerable` to false even thought this makes no practical difference
      // (symbols are never enumerated) because it can provide a hint in the
      // debugger that the property is for internal use.
      Object.defineProperty(child, symbols.parent, {
        configurable: true,
        enumerable: false,
        value: parent,
        writable: true,
      });
    } catch (error) {
      // Ignore exceptions. Some esoteric objects don't allow adding properties.
      // We can still treat them as trees, but they won't have a parent.
    }
  }
}
