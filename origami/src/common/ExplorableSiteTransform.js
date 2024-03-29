import { Tree, keysJson } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import index from "../builtins/@index.js";
import { transformObject } from "../common/utilities.js";

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
      // The empty string key represents "index.html".
      if (key === "") {
        key = "index.html";
      }

      // Ask the tree if it has the key.
      let value = await super.get(key);

      if (value === undefined) {
        // The tree doesn't have the key; try the defaults.
        const scope = Scope.getScope(this);
        if (scope) {
          if (key === "index.html") {
            value = await index.call(scope, this);
          } else if (key === ".keys.json") {
            value = await keysJson.stringify(this);
          }
        }
      }

      // Ensure this transform is applied to any explorable result. This lets
      // the user browse into data and explorable trees of types other than the
      // current class.
      if (Tree.isAsyncTree(value)) {
        value = transformObject(ExplorableSiteTransform, value);
      }

      if (value?.unpack) {
        // If the value isn't a tree, but has a tree attached via a `unpack`
        // method, wrap the unpack method to add this transform.
        const original = value.unpack.bind(value);
        value.unpack = async () => {
          const content = await original();
          if (!Tree.isTreelike(content)) {
            return content;
          }
          /** @type {any} */
          let tree = Tree.from(content);
          tree = transformObject(ExplorableSiteTransform, tree);
          return tree;
        };
      }
      return value;
    }
  };
}
