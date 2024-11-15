import map from "./map.js";

/**
 * Return a transform function that maps the keys and/or values of a tree.
 *
 * @typedef {import("../../index.ts").KeyFn} KeyFn
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {ValueKeyFn|{ deep?: boolean, description?: string, needsSourceValue?: boolean, inverseKey?: KeyFn, key?: KeyFn, value?: ValueKeyFn }} options
 * @returns {import("../../index.ts").TreeTransform}
 */
export default function createMapTransform(options = {}) {
  console.warn("No one should be calling mapFn");
  return (tree) => map(tree, options);
}
