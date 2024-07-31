import { Tree } from "../internal.js";

/**
 * A tree's "scope" is the collection of everything in that tree and all of its
 * ancestors.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @returns {AsyncTree & {trees: AsyncTree[]}}
 */
export default function scope(treelike) {
  const tree = Tree.from(treelike);

  return {
    // Starting with this tree, search up the parent hierarchy.
    async get(key) {
      /** @type {AsyncTree|null|undefined} */
      let current = tree;
      let value;
      while (current) {
        value = await current.get(key);
        if (value !== undefined) {
          break;
        }
        current = current.parent;
      }
      return value;
    },

    // Collect all keys for this tree and all parents
    async keys() {
      const keys = new Set();

      /** @type {AsyncTree|null|undefined} */
      let current = tree;
      while (current) {
        for (const key of await current.keys()) {
          keys.add(key);
        }
        current = current.parent;
      }

      return keys;
    },

    // Collect all keys for this tree and all parents.
    //
    // This method exists for debugging purposes, as it's helpful to be able to
    // quickly flatten and view the entire scope chain.
    get trees() {
      const result = [];

      /** @type {AsyncTree|null|undefined} */
      let current = tree;
      while (current) {
        result.push(current);
        current = current.parent;
      }

      return result;
    },
  };
}
