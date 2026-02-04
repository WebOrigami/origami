import AsyncMap from "../drivers/AsyncMap.js";
import FunctionMap from "../drivers/FunctionMap.js";
import ObjectMap from "../drivers/ObjectMap.js";
import SetMap from "../drivers/SetMap.js";
import * as symbols from "../symbols.js";
import box from "../utilities/box.js";
import isPlainObject from "../utilities/isPlainObject.js";
import setParent from "../utilities/setParent.js";
import isMap from "./isMap.js";

/**
 * Attempts to cast the indicated object to a map.
 *
 * If the object is a plain object, it will be converted to an ObjectMap. The
 * optional `deep` option can be set to `true` to convert a plain object to a
 * deep ObjectMap. The optional `parent` parameter will be used as the default
 * parent of the new tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike | Object} object
 * @param {{ deep?: boolean, parent?: Map|AsyncMap|null }} [options]
 * @returns {Map|AsyncMap}
 */
export default function from(object, options = {}) {
  const deep = options.deep ?? object?.[symbols.deep];
  let map;
  if (object == null) {
    throw new TypeError("The tree argument wasn't defined.");
  } else if (object instanceof Promise) {
    // A common mistake
    throw new TypeError(
      "The tree argument was a Promise. Did you mean to use await?",
    );
  } else if (isMap(object)) {
    // Already a map
    return object;
  } else if (typeof object === "function") {
    map = new FunctionMap(object);
  } else if (object instanceof Set) {
    map = new SetMap(object);
  } else if (isPlainObject(object) || object instanceof Array) {
    map = new ObjectMap(object, { deep });
    // @ts-ignore
  } else if (globalThis.Iterator && object instanceof Iterator) {
    const array = Array.from(object);
    map = new ObjectMap(array, { deep });
  } else if (object && typeof object === "object") {
    // An instance of some class.
    map = new ObjectMap(object, { deep });
  } else if (
    typeof object === "string" ||
    typeof object === "number" ||
    typeof object === "boolean"
  ) {
    // A primitive value; box it into an object and construct a tree.
    const boxed = box(object);
    map = new ObjectMap(boxed);
  } else {
    throw new TypeError("Couldn't convert argument to a map");
  }

  if (options.parent) {
    setParent(map, options.parent);
  }

  return map;
}
