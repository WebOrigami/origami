import * as Tree from "./Tree.js";

const Plain = {};

// Wrap each Tree method to return a plain value instead of a map-based tree
for (const name of Object.keys(Tree)) {
  Object.defineProperty(Plain, name, {
    get() {
      return async (...args) => {
        let value = await Tree[name](...args);
        return Tree.isMap(value) ? Tree.plain(value) : value;
      };
    },
  });
}

export default Plain;
