import { Tree, isPlainObject } from "@weborigami/async-tree";
import ExplorableSiteTransform from "../common/ExplorableSiteTransform.js";
import { isTransformApplied, transformObject } from "../common/utilities.js";
import OriCommandTransform from "../misc/OriCommandTransform.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

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
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return;
  }

  // The debug command leaves the tree's existing scope intact; it does not
  // apply its own scope to the tree.
  let tree = Tree.from(treelike);

  if (!isTransformApplied(ExplorableSiteTransform, tree)) {
    tree = transformObject(ExplorableSiteTransform, tree);
  }

  tree = transformObject(DebugTransform, tree);

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

      // Since this transform is for diagnostic purposes, cast arrays
      // or plain objects to trees so we can debug them too.
      if (value instanceof Array || isPlainObject(value)) {
        value = Tree.from(value);
      }

      // Ensure debug transforms are applied to explorable results.
      if (Tree.isAsyncTree(value)) {
        if (!isTransformApplied(ExplorableSiteTransform, value)) {
          value = transformObject(ExplorableSiteTransform, value);
        }

        if (!isTransformApplied(DebugTransform, value)) {
          value = transformObject(DebugTransform, value);
        }
      }

      if (value?.unpack) {
        // If the value isn't a tree, but has a tree attached via an `unpack`
        // method, wrap the unpack method to provide debug support for it.
        const original = value.unpack.bind(value);
        value.unpack = async () => {
          let content = await original();
          if (!Tree.isTreelike(content)) {
            return content;
          }
          /** @type {any} */
          let tree = Tree.from(content);
          if (!isTransformApplied(ExplorableSiteTransform, tree)) {
            tree = transformObject(ExplorableSiteTransform, tree);
          }
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
