import { trailingSlash, Tree } from "@weborigami/async-tree";

export default function filter(a, b) {
  a = Tree.from(a);
  b = Tree.from(b);

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
      const [aIterator, bIterator] = await Promise.all([a.keys(), b.keys()]);
      const aKeys = [...aIterator];
      const bKeys = [...bIterator];
      const bValues = await Promise.all(bKeys.map((key) => b.get(key)));
      // Add trailing slashes to keys that are subtrees
      const bKeySlashes = bKeys.map((key, index) =>
        trailingSlash.toggle(key, Tree.isTreelike(bValues[index]))
      );
      const keys = bKeySlashes.filter((key, index) => {
        return aKeys.includes(trailingSlash.remove(key))
          ? bValues[index]
          : false;
      });
      return keys;
    },
  };
}
