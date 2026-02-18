import { Tree, jsonKeys } from "@weborigami/async-tree";
import indexPage from "../../origami/indexPage.js";

/**
 * Extend the given map-based tree with debugging resources
 */
export default function mergeDebugResources(source) {
  const merged = {
    async get(key) {
      // Ask the tree if it has the key.
      let value = await source.get(key);

      if (value === undefined) {
        // The tree doesn't have the key; try the defaults.
        if (key === "index.html") {
          // Generate an index page for this site
          value = await indexPage(this);
        } else if (key === ".keys.json") {
          value = await jsonKeys.stringify(this);
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
          // See function notes at @debug
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

    source,
  };

  // If this value is given to the server, the server will call this pack()
  // method. We respond with the index page.
  merged.pack = async function pack() {
    return this.get("index.html");
  };

  return merged;
}
