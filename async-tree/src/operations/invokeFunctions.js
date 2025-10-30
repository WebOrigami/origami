import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import isAsyncTree from "./isAsyncTree.js";

export default async function invokeFunctions(treelike) {
  const tree = await getTreeArgument(treelike, "invokeFunctions");

  return Object.assign(new AsyncMap(), {
    description: "invokeFunctions",

    async get(key) {
      let value = await tree.get(key);
      if (typeof value === "function") {
        value = value();
      } else if (isAsyncTree(value)) {
        value = invokeFunctions(value);
      }
      return value;
    },

    async *keys() {
      for await (const key of tree.keys()) {
        yield key;
      }
    },

    source: tree,
  });
}
