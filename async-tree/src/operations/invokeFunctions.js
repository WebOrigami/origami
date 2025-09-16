import from from "./from.js";
import isAsyncTree from "./isAsyncTree.js";

export default async function invokeFunctions(treelike) {
  const tree = from(treelike);
  return {
    async get(key) {
      let value = await tree.get(key);
      if (typeof value === "function") {
        value = value();
      } else if (isAsyncTree(value)) {
        value = invokeFunctions(value);
      }
      return value;
    },

    async keys() {
      return tree.keys();
    },
  };
}
