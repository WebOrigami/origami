import { isPlainObject } from "@weborigami/async-tree";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import treeMap from "./@map.js";

/**
 * Map a deep tree of keys and values to a new tree of keys and values.
 *
 * @typedef {import("@weborigami/async-tree").KeyFn} KeyFn
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("@weborigami/async-tree").TreeTransform} TreeTransform
 * @typedef {import("../../index.ts").TreelikeTransform} TreelikeTransform
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @typedef {{ description?: string, extension?: string,
 * extensions?: string, inverseKey?: KeyFn, key?: ValueKeyFn, keyMap?:
 * ValueKeyFn, value?: ValueKeyFn, valueFn?: ValueKeyFn }} TreeMapOptions
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 *
 * @overload
 * @param {ValueKeyFn} param1
 * @returns {TreelikeTransform}
 *
 * @overload
 * @param {TreeMapOptions} param1
 * @returns {TreelikeTransform}
 *
 * @overload
 * @param {Treelike} param1
 * @param {ValueKeyFn} param2
 * @returns {AsyncTree}
 *
 * @overload
 * @param {Treelike} param1
 * @param {TreeMapOptions} param2
 * @returns {AsyncTree}
 */
export default function mapDeep(param1, param2) {
  assertScopeIsDefined(this, "mapDeep");

  // Identify whether the valueFn/options are the first parameter
  // or the second.
  let source;
  let options;
  if (param2 === undefined) {
    options = param1;
  } else {
    source = param1;
    if (isPlainObject(param2)) {
      options = param2;
    } else {
      options = { value: param2 };
    }
  }

  options.deep = true;
  return treeMap.call(this, source, options);
}
