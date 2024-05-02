import { isPlainObject } from "@weborigami/async-tree";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import treeMap from "./@map.js";

/**
 * Map a hierarchical tree of keys and values to a new tree of keys and values.
 *
 * @typedef {import("@weborigami/async-tree").KeyFn} KeyFn
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("@weborigami/async-tree").TreeTransform} TreeTransform
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @typedef {{ deep?: boolean, description?: string, extension?: string,
 * extensions?: string, inverseKey?: KeyFn, key?: ValueKeyFn, keyMap?:
 * ValueKeyFn, needsSourceValue?: boolean, value?: ValueKeyFn, valueMap?:
 * ValueKeyFn }} MapOptionsDictionary
 *
 * @typedef {ValueKeyFn|MapOptionsDictionary} OptionsOrValueFn
 *
 * @overload
 * @param {Treelike} source
 * @param {OptionsOrValueFn} instructions
 * @returns {AsyncTree}
 *
 * @overload
 * @param {OptionsOrValueFn} instructions
 * @returns {TreeTransform}
 *
 * @this {AsyncTree|null}
 * @param {Treelike|OptionsOrValueFn} param1
 * @param {OptionsOrValueFn} [param2]
 */
export default function mapDeep(param1, param2) {
  assertScopeIsDefined(this, "mapDeep");

  // Identify whether the map instructions are the first parameter or the
  // second.
  if (arguments.length === 1) {
    // One argument, which is a dictionary or function.
    /** @type {MapOptionsDictionary} */
    const options = isPlainObject(param1)
      ? // Dictionary
        { ...param1, deep: true }
      : // Function
        { deep: true, value: param1 };
    const transform = treeMap.call(this, options);
    return transform;
  } else {
    // Two arguments, second is a dictionary or function.
    /** @type {Treelike} */
    const source = param1;
    /** @type {MapOptionsDictionary} */
    const options = isPlainObject(param2)
      ? // Dictionary
        { ...param2, deep: true }
      : // Function
        { deep: true, value: param2 };

    // We go through some type gymnastics to convince TypeScript that the return
    // value is an AsyncTree. Using `.call()` with the overloaded `@map`
    // function seems to confuse TypeScript into thinking the call will return a
    // TreeTransform.

    /** @type {AsyncTree} */
    let tree;
    // @ts-ignore
    tree = treeMap.call(this, source, options);
    return tree;
  }
}
