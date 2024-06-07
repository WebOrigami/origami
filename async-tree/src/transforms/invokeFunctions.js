import { Tree } from "../internal.js";

export default function invokeFunctions(treelike) {
  const tree = Tree.from(treelike);
  return {
    async get(key) {
      let value = await tree.get(key);
      if (typeof value === "function") {
        value = value();
      }
      return value;
    },

    async keys() {
      return tree.keys();
    },
  };
}
