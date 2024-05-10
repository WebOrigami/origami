import mapFn from "../transforms/mapFn.js";

/**
 * Transform the keys and/or values of a tree.
 *
 * @typedef {import("../../index.ts").KeyFn} KeyFn
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {ValueKeyFn|{ deep?: boolean, description?: string, needsSourceValue?: boolean, inverseKey?: KeyFn, key?: KeyFn, value?: ValueKeyFn }} options
 */
export default function map(treelike, options = {}) {
  return mapFn(options)(treelike);
}
