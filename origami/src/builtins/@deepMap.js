import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import deepMapFn from "./@deepMapFn.js";

/**
 * Shorthand for calling `@map` with `deep: true` option.
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
 * @this {AsyncTree|null}
 * @param {Treelike} source
 * @param {ValueKeyFn|MapOptionsDictionary} operation
 */
export default function deepMap(source, operation) {
  assertScopeIsDefined(this, "deepMap");
  return deepMapFn.call(this, operation)(source);
}
