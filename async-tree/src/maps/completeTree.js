/**
 * Return a function that maps an async tree to another async tree.
 *
 * This accepts a partial function that can define any of the members of the
 * AsyncTree interface, and returns a function that will complete the
 * implementation of the AsyncTree interface.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 *
 * @param {AsyncTree} tree
 * @param {any} partialTree
 * @returns {AsyncTree}
 */
export default function completeTree(tree, partialTree) {
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
    partialTree(tree)
  );
}
