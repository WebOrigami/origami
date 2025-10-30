import AsyncMap from "../drivers/AsyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import isMap from "./isMap.js";

/**
 * Return the interior nodes of the tree. This relies on subtree keys having
 * trailing slashes.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function inners(maplike) {
  const tree = await getTreeArgument(maplike, "inners");

  return Object.assign(new AsyncMap(), {
    async get(key) {
      const value = await tree.get(key);
      return isMap(value) ? inners(value) : undefined;
    },

    async *keys() {
      for await (const key of tree.keys()) {
        if (trailingSlash.has(key)) {
          yield key;
        }
      }
    },
  });
}
