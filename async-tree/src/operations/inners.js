import AsyncMap from "../drivers/AsyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import getMapArgument from "../utilities/getMapArgument.js";
import isMap from "./isMap.js";

/**
 * Return the interior nodes of the tree. This relies on subtree keys having
 * trailing slashes.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function inners(maplike) {
  const source = await getMapArgument(maplike, "Tree.inners");

  return Object.assign(new AsyncMap(), {
    async get(key) {
      const value = await source.get(key);
      return isMap(value) ? inners(value) : undefined;
    },

    async *keys() {
      for await (const key of source.keys()) {
        if (trailingSlash.has(key)) {
          yield key;
        }
      }
    },

    trailingSlashKeys: /** @type {any} */ (source).trailingSlashKeys,
  });
}
