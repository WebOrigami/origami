import {
  AsyncMap,
  Tree,
  getTreeArgument,
  jsonKeys,
} from "@weborigami/async-tree";
import indexPage from "./indexPage.js";

/**
 * Expose common static keys (index.html, .keys.json) for a tree.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<AsyncMap>}
 */
export default async function staticBuiltin(maplike) {
  const source = await getTreeArgument(maplike, "static");
  return staticMap(source);
}

// The name we'll register as a builtin
staticBuiltin.key = "static";

function staticMap(source) {
  const result = Object.assign(new AsyncMap(), {
    description: "static",

    async get(key) {
      let value = await source.get(key);
      if (value === undefined && key === "index.html") {
        value = await indexPage(this);
      } else if (value === undefined && key === ".keys.json") {
        value = await jsonKeys.stringify(this);
      } else if (Tree.isMaplike(value)) {
        const subtree = Tree.from(value, { parent: result });
        value = staticMap(subtree);
      }
      return value;
    },

    async *keys() {
      let needsIndex = true;
      let needsKeysJson = true;
      for await (const key of source.keys()) {
        if (key === "index.html") {
          needsIndex = false;
        }
        if (key === ".keys.json") {
          needsKeysJson = false;
        }
        yield key;
      }
      if (needsIndex) {
        yield "index.html";
      }
      if (needsKeysJson) {
        yield ".keys.json";
      }
    },

    source: source,

    trailingSlashKeys: source.trailingSlashKeys,
  });

  return result;
}
