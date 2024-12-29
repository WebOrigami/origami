import { trailingSlash, Tree } from "@weborigami/async-tree";

export default function filter(a, b) {
  a = Tree.from(a);
  b = Tree.from(b, { deep: true });

  return {
    async get(key) {
      const bValue = await b.get(key);
      if (!bValue) {
        return undefined;
      }
      let aValue = await a.get(key);
      if (Tree.isTreelike(aValue)) {
        return filter(aValue, bValue);
      } else {
        return aValue;
      }
    },

    async keys() {
      // Use a's keys as the basis
      const aKeys = [...(await a.keys())];
      const bValues = await Promise.all(aKeys.map((key) => b.get(key)));
      // An async tree value in b implies that the a key should have a slash
      const aKeySlashes = aKeys.map((key, index) =>
        trailingSlash.toggle(
          key,
          trailingSlash.has(key) || Tree.isAsyncTree(bValues[index])
        )
      );
      // Remove keys that don't have values in b
      const keys = aKeySlashes.filter((key, index) => bValues[index] ?? false);
      return keys;
    },
  };
}
