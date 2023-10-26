/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("../..").Constructor<AsyncTree>} AsyncTreeConstructor
 * @param {AsyncTreeConstructor} Base
 */
export default function SortTransform(Base) {
  return class Sort extends Base {
    async keys() {
      const keys = Array.from(await super.keys());
      keys.sort();
      return keys;
    }
  };
}
