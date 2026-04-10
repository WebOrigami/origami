import AsyncMap from "../drivers/AsyncMap.js";
import * as args from "../utilities/args.js";
import isMap from "./isMap.js";

export default async function invokeFunctions(maplike) {
  const source = await args.map(maplike, "Tree.invokeFunctions", {
    deep: true,
  });

  const result = Object.assign(new AsyncMap(), {
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

  if (!(/** @type {any} */ (source).readOnly)) {
    Object.assign(result, {
      delete(key) {
        return source.delete(key);
      },

      set(key, value) {
        return source.set(key, value);
      },
    });
  }

  return result;
}
