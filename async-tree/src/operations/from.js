import DeepObjectMap from "../drivers/DeepObjectMap.js";
import DeferredTree from "../drivers/DeferredTree.js";
import FunctionTree from "../drivers/FunctionTree.js";
import ObjectMap from "../drivers/ObjectMap.js";
import SetTree from "../drivers/SetTree.js";
import SyncMap from "../drivers/SyncMap.js";
import * as symbols from "../symbols.js";
import box from "../utilities/box.js";
import isPlainObject from "../utilities/isPlainObject.js";
import isUnpackable from "../utilities/isUnpackable.js";
import isAsyncTree from "./isAsyncTree.js";

/**
 * Attempts to cast the indicated object to an asynchronous tree.
 *
 * If the object is a plain object, it will be converted to an ObjectTree. The
 * optional `deep` option can be set to `true` to convert a plain object to a
 * DeepObjectTree. The optional `parent` parameter will be used as the default
 * parent of the new tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {Treelike | Object} object
 * @param {{ deep?: boolean, parent?: AsyncTree|null }} [options]
 * @returns {AsyncTree}
 */
export default function from(object, options = {}) {
  const deep = options.deep ?? object[symbols.deep];
  let tree;
  if (object == null) {
    throw new TypeError("The tree argument wasn't defined.");
  } else if (object instanceof Promise) {
    // A common mistake
    throw new TypeError(
      "The tree argument was a Promise. Did you mean to use await?"
    );
  } else if (isAsyncTree(object)) {
    // Argument already supports the tree interface.
    // @ts-ignore
    return object;
  } else if (typeof object === "function") {
    tree = new FunctionTree(object);
  } else if (object instanceof Map) {
    tree = new SyncMap(object);
  } else if (object instanceof Set) {
    tree = new SetTree(object);
  } else if (isPlainObject(object) || object instanceof Array) {
    tree = deep ? new DeepObjectMap(object) : new ObjectMap(object);
  } else if (isUnpackable(object)) {
    async function AsyncFunction() {} // Sample async function
    tree =
      object.unpack instanceof AsyncFunction.constructor
        ? // Async unpack: return a deferred tree.
          new DeferredTree(object.unpack, { deep })
        : // Synchronous unpack: cast the result of unpack() to a tree.
          from(object.unpack());
  } else if (object && typeof object === "object") {
    // An instance of some class.
    tree = new ObjectMap(object);
  } else if (
    typeof object === "string" ||
    typeof object === "number" ||
    typeof object === "boolean"
  ) {
    // A primitive value; box it into an object and construct a tree.
    const boxed = box(object);
    tree = new ObjectMap(boxed);
  } else {
    throw new TypeError("Couldn't convert argument to an async tree");
  }

  if (!tree.parent && options.parent) {
    tree.parent = options.parent;
  }
  return tree;
}
