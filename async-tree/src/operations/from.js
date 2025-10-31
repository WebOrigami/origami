import AsyncMap from "../drivers/AsyncMap.js";
import DeepObjectMap from "../drivers/DeepObjectMap.js";
import FunctionMap from "../drivers/FunctionMap.js";
import ObjectMap from "../drivers/ObjectMap.js";
import SetMap from "../drivers/SetMap.js";
import * as symbols from "../symbols.js";
import box from "../utilities/box.js";
import isPlainObject from "../utilities/isPlainObject.js";
import isMap from "./isMap.js";

/**
 * Attempts to cast the indicated object to a map.
 *
 * If the object is a plain object, it will be converted to an ObjectMap. The
 * optional `deep` option can be set to `true` to convert a plain object to a
 * DeepObjectMap. The optional `parent` parameter will be used as the default
 * parent of the new tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike | Object} object
 * @param {{ deep?: boolean, parent?: Map|AsyncMap|null }} [options]
 * @returns {Map|AsyncMap}
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
  } else if (isMap(object)) {
    // Already a map
    return object;
  } else if (typeof object === "function") {
    tree = new FunctionMap(object);
  } else if (object instanceof Set) {
    tree = new SetMap(object);
  } else if (isPlainObject(object) || object instanceof Array) {
    tree = deep ? new DeepObjectMap(object) : new ObjectMap(object);
    // @ts-ignore
  } else if (object instanceof Iterator) {
    const array = Array.from(object);
    tree = new ObjectMap(array);
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
    throw new TypeError("Couldn't convert argument to a map");
  }

  if ("parent" in tree && !tree.parent && options.parent) {
    tree.parent = options.parent;
  }
  return tree;
}
