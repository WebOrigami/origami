import { getTreeArgument, Tree } from "@weborigami/async-tree";
import { isTransformApplied, transformObject } from "../common/utilities.js";
import ExplorableSiteTransform from "./ExplorableSiteTransform.js";
import OriCommandTransform from "./OriCommandTransform.js";

/**
 * Add debugging features to the indicated tree.
 *
 * @typedef {import("@weborigami/async-tree").AsyncMap} AsyncMap
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<Map|AsyncMap>}
 */
export default async function debug(maplike) {
  let tree = await getTreeArgument(maplike, "Dev.debug");

  if (!isTransformApplied(DebugTransform, tree)) {
    tree = transformObject(DebugTransform, tree);
  }
  if (!isTransformApplied(ExplorableSiteTransform, tree)) {
    tree = transformObject(ExplorableSiteTransform, tree);
  }

  return tree;
}

/**
 * @typedef {import("../../index.ts").Constructor<AsyncMap>} AsyncMapConstructor
 * @param {AsyncMapConstructor} Base
 */
function DebugTransform(Base) {
  return class Debug extends OriCommandTransform(Base) {
    async get(key) {
      let value = await super.get(key);
      const parent = this;

      // Since this transform is for diagnostic purposes, cast any maplike
      // result to a tree so we can debug the result too. (Don't do this for
      // functions, as that can be undesirable, e.g., when writing functions
      // that handle POST requests.)
      if (Tree.isMaplike(value) && typeof value !== "function") {
        // @ts-ignore
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
          // @ts-ignore
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
