/**
 * Return a transform function that sorts a tree's keys.
 *
 * For sorting, the keys are converted to strings, then sorted according to each
 * character's Unicode code point value.
 *
 * @param {(a: any, b: any) => number} [compareFn]
 */
export default function createSortTransform(compareFn) {
  /**
   * @type {import("../../index.ts").TreeTransform}
   */
  return function sortTransform(tree) {
    const transform = Object.create(tree);
    transform.keys = async () => {
      const keys = Array.from(await tree.keys());
      keys.sort(compareFn);
      return keys;
    };
    return transform;
  };
}
