import AsyncMap from "../drivers/AsyncMap.js";
import getMapArgument from "../utilities/getMapArgument.js";
import isMap from "./isMap.js";

export default async function invokeFunctions(maplike) {
  const source = await getMapArgument(maplike, "Tree.invokeFunctions", {
    deep: true,
  });

  return Object.assign(new AsyncMap(), {
    description: "invokeFunctions",

    async get(key) {
      let value = await source.get(key);
      if (typeof value === "function") {
        value = value();
      } else if (isMap(value)) {
        value = invokeFunctions(value);
      }
      return value;
    },

    async *keys() {
      for await (const key of source.keys()) {
        yield key;
      }
    },

    source: source,

    trailingSlashKeys: /** @type {any} */ (source).trailingSlashKeys,
  });
}
