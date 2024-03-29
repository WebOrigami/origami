/**
 * Return a tree that performs a shallow merge of the given trees.
 *
 * Given a set of trees, the `get` method looks at each tree in turn. The first
 * tree is asked for the value with the key. If an tree returns a defined value
 * (i.e., not undefined), that value is returned. If the first tree returns
 * undefined, the second tree will be asked, and so on. If none of the trees
 * return a defined value, the `get` method returns undefined.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @returns {AsyncTree & { description: string }}
 */
export default function merge(...sources) {
  let trees = sources;
  let mergeParent;
  return {
    description: "merge",

    async get(key) {
      for (const tree of trees) {
        const value = await tree.get(key);
        if (value !== undefined) {
          return value;
        }
      }
      return undefined;
    },

    async isKeyForSubtree(key) {
      for (const tree of trees) {
        if (await tree.isKeyForSubtree(key)) {
          return true;
        }
      }
      return false;
    },

    async keys() {
      const keys = new Set();
      for (const tree of trees) {
        for (const key of await tree.keys()) {
          keys.add(key);
        }
      }
      return keys;
    },

    get parent() {
      return mergeParent;
    },
    set parent(parent) {
      mergeParent = parent;
      trees = sources.map((source) => {
        const tree = Object.create(source);
        tree.parent = parent;
        return tree;
      });
    },
  };
}
