import { Tree, jsonKeys } from "@weborigami/async-tree";
import { isTransformApplied, transformObject } from "../common/utilities.js";
import indexPage from "../origami/indexPage.js";

/**
 * Wraps a tree (typically a SiteTree) to turn a standard site into an
 * explorable site.
 *
 * An explorable site follows three conventions:
 * 1. if route /foo has any resources beneath it (/foo/bar.jpg), then /foo
 *    redirects to /foo/
 * 2. /foo/ is a synonym for foo/index.html
 * 3. /foo/.keys.json returns the public keys below foo/
 *
 * The first convention is handled by the Tree Origami server. This transform
 * handles the second and third conventions.
 *
 * As a convenience, this transform also provides a default index.html page if
 * the tree doesn't define one.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Constructor<AsyncTree>} AsyncTreeConstructor
 * @param {AsyncTreeConstructor} Base
 */
export default function ExplorableSiteTransform(Base) {
  return class ExplorableSite extends Base {
    async get(key) {
      // Ask the tree if it has the key.
      let value = await super.get(key);

      if (value === undefined) {
        // The tree doesn't have the key; try the defaults.
        if (key === "index.html") {
          // This tree is both the function call target and the parameter.
          value = await indexPage.call(this, this);
        } else if (key === ".keys.json") {
          value = await jsonKeys.stringify(this);
        }
      }

      if (Tree.isAsyncTree(value)) {
        // Ensure this transform is applied to any tree result so the user
        // browse into data and trees of classes other than the current class.
        if (!isTransformApplied(ExplorableSiteTransform, value)) {
          value = transformObject(ExplorableSiteTransform, value);
        }
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
          if (!isTransformApplied(ExplorableSiteTransform, tree)) {
            tree = transformObject(ExplorableSiteTransform, tree);
          }
          return tree;
        };
      }
      return value;
    }

    // If this value is given to the server, the server will call this pack()
    // method. We respond with the index page.
    async pack() {
      return this.get("index.html");
    }
  };
}
