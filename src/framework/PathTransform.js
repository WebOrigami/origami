import ExplorableGraph from "../core/ExplorableGraph.js";

const pathKey = Symbol("node:path");

export default function PathTransform(Base) {
  return class Path extends Base {
    // Initialize this[pathKey] to shut up TypeScript.
    constructor(...args) {
      super(...args);
      this[pathKey] = null;
    }

    async get(key) {
      let value = await super.get(key);
      if (ExplorableGraph.isExplorable(value)) {
        const path = this[pathKey] ? `${this[pathKey]}/${key}` : key;
        value[pathKey] = path;
      } else if (value === undefined && key === "@path") {
        value = this[pathKey];
      }
      return value;
    }
  };
}
