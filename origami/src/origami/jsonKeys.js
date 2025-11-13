import {
  AsyncMap,
  Tree,
  getTreeArgument,
  jsonKeys,
} from "@weborigami/async-tree";

/**
 * Expose .keys.json for a tree.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<AsyncMap>}
 */
export default async function jsonKeysBuiltin(maplike) {
  const source = await getTreeArgument(maplike, "jsonKeys");
  return jsonKeysMap(source);
}

function jsonKeysMap(source) {
  const result = Object.assign(new AsyncMap(), {
    description: "jsonKeys",

    async get(key) {
      let value = await source.get(key);
      if (value === undefined && key === ".keys.json") {
        value = await jsonKeys.stringify(this);
      } else if (Tree.isMaplike(value)) {
        const subtree = Tree.from(value, { deep: true, parent: result });
        value = jsonKeysMap(subtree);
      }
      return value;
    },

    async *keys() {
      const treeKeys = new Set(await Tree.keys(source));
      treeKeys.add(".keys.json");
      yield* treeKeys;
    },

    source: source,

    trailingSlashKeys: source.trailingSlashKeys,
  });
  return result;
}
