/**
 * Return a function that maps an async tree to another async tree.
 *
 * This accepts a partial function that can define any of the members of the
 * AsyncTree interface, and returns a function that will complete the
 * implementation of the AsyncTree interface.
 *
 * @param {Function} partialMapFn
 * @returns {import("../../index.js").TreeMap}
 */
export default function completeTree(partialMapFn) {
  /**
   * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
   *
   * @param {AsyncTree} tree
   * @returns {AsyncTree}
   */
  return function completedMapFn(tree) {
    return Object.assign(
      {
        async get(key) {
          return tree.get(key);
        },

        async keys() {
          return tree.keys();
        },

        get parent() {
          return tree.parent;
        },
        set parent(parent) {
          tree.parent = parent;
        },

        tree,
      },
      partialMapFn(tree)
    );
  };
}
