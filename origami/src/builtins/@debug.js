import { Dictionary, Tree } from "@graphorigami/core";
import ExplorableSiteTransform from "../common/ExplorableSiteTransform.js";
import {
  isPlainObject,
  isTransformApplied,
  transformObject,
} from "../common/utilities.js";
import OriCommandTransform from "../framework/OriCommandTransform.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Add debugging features to the indicated tree.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 *
 * @this {AsyncDictionary|null}
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
 * @typedef {import("../..").Constructor<AsyncDictionary>} AsyncDictionaryConstructor
 * @param {AsyncDictionaryConstructor} Base
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
      if (Dictionary.isAsyncDictionary(value)) {
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
debug.documentation = "https://graphorigami.org/language/@debug.html";
