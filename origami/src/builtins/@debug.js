import { Tree } from "@weborigami/async-tree";
import ExplorableSiteTransform from "../common/ExplorableSiteTransform.js";
import { isTransformApplied, transformObject } from "../common/utilities.js";
import OriCommandTransform from "../misc/OriCommandTransform.js";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Add debugging features to the indicated tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function debug(treelike) {
  // The debug command leaves the tree's existing scope intact; it does not
  // apply its own scope to the tree.
  let tree = await getTreeArgument(this, arguments, treelike, "@debug");

  if (!isTransformApplied(DebugTransform, tree)) {
    tree = transformObject(DebugTransform, tree);
  }
  if (!isTransformApplied(ExplorableSiteTransform, tree)) {
    tree = transformObject(ExplorableSiteTransform, tree);
  }

  return tree;
}

/**
 * @typedef {import("../../index.ts").Constructor<AsyncTree>} AsyncTreeConstructor
 * @param {AsyncTreeConstructor} Base
 */
function DebugTransform(Base) {
  return class Debug extends OriCommandTransform(Base) {
    async get(key) {
      let value = await super.get(key);
      const parent = this;

      // Since this transform is for diagnostic purposes, cast any treelike
      // result to a tree so we can debug the result too. (Don't do this for
      // functions, as that can be undesirable, e.g., when writing functions
      // that handle POST requests.)
      if (Tree.isTreelike(value) && typeof value !== "function") {
        value = Tree.from(value, { parent });
        if (!isTransformApplied(DebugTransform, value)) {
          value = transformObject(DebugTransform, value);
        }
      } else if (value?.unpack) {
        // If the value isn't a tree, but has a tree attached via an `unpack`
        // method, wrap the unpack method to provide debug support for it.
        const original = value.unpack.bind(value);
        value.unpack = async () => {
          let content = await original();
          if (!Tree.isTraversable(content)) {
            return content;
          }
          /** @type {any} */
          let tree = Tree.from(content, { parent });
          if (!isTransformApplied(DebugTransform, tree)) {
            tree = transformObject(DebugTransform, tree);
          }
          return tree;
        };
      }

      return value;
    }
  };
}

debug.usage = `@debug <tree>\tAdd debug features to a tree`;
debug.documentation = "https://weborigami.org/language/@debug.html";
