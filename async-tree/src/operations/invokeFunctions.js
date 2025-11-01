import AsyncMap from "../drivers/AsyncMap.js";
import getMapArgument from "../utilities/getMapArgument.js";
import isMap from "./isMap.js";

export default async function invokeFunctions(maplike, options = {}) {
  const deep = options.deep ?? false;
  const tree = await getMapArgument(maplike, "invokeFunctions", { deep });

  return Object.assign(new AsyncMap(), {
    description: "invokeFunctions",

    async get(key) {
      let value = await tree.get(key);
      if (typeof value === "function") {
        value = value();
      } else if (isMap(value)) {
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
