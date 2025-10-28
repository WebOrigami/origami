import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import keys from "./keys.js";

/**
 * A tree's "scope" is the collection of everything in that tree and all of its
 * ancestors.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @returns {Promise<AsyncTree & {trees: AsyncTree[]}>}
 */
export default async function scope(treelike) {
  const tree = await getTreeArgument(treelike, "scope");

  return Object.assign(new AsyncMap(), {
    description: "scope",

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
      const scopeKeys = new Set();

      /** @type {AsyncTree|null|undefined} */
      let current = tree;
      while (current) {
        for (const key of await keys(current)) {
          scopeKeys.add(key);
        }
        current = current.parent;
      }

      return scopeKeys;
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

    source: tree,
  });
}
