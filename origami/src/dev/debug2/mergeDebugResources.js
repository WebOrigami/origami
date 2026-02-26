import { Tree, jsonKeys } from "@weborigami/async-tree";
import indexPage from "../../origami/indexPage.js";

/**
 * Extend the given map-based tree with debugging resources
 *
 * @param {import("@weborigami/async-tree").Maplike} maplike
 */
export default function mergeDebugResources(maplike) {
  const source = Tree.from(maplike);
  return {
    async get(key) {
      // Ask the tree if it has the key.
      let value = await source.get(key);

      if (value === undefined) {
        // The tree doesn't have the key; try the defaults.
        if (key === "index.html") {
          // Generate an index page for this site
          value = await indexPage(source);
        } else if (key === ".keys.json") {
          value = await jsonKeys.stringify(source);
        }
      }

      if (Tree.isMap(value)) {
        // Ensure this transform is applied to any map result
        value = mergeDebugResources(value);
      } else if (value?.unpack) {
        // If the value isn't a tree, but has a tree attached via an `unpack`
        // method, wrap the unpack method to add this transform.
        const original = value.unpack.bind(value);
        value.unpack = async () => {
          const content = await original();
          if (!Tree.isTraversable(content) || typeof content === "function") {
            return content;
          }
          /** @type {any} */
          let tree = Tree.from(content);
          return mergeDebugResources(tree);
        };
      }
      return value;
    },

    async keys() {
      return source.keys();
    },

    // If this value is given to the server, the server will call this pack()
    // method. We respond with the index page.
    async pack() {
      return this.get("index.html");
    },

    source,
  };
}
