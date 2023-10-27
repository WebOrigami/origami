/** @typedef {import("@graphorigami/types").AsyncTree} AsyncTree */
import { ObjectTree, Tree } from "@graphorigami/core";
import ori from "../builtins/@ori.js";
import {
  isTransformApplied,
  keySymbol,
  transformObject,
} from "../common/utilities.js";
import Scope from "../runtime/Scope.js";

/**
 * Add support for commands prefixed with `!`.
 *
 * E.g., asking this tree for `!yaml` will invoke the yaml() builtin function
 * in the context of this tree.
 *
 * @typedef {import("../../index.js").Constructor<AsyncTree>} AsyncTreeConstructor
 * @param {AsyncTreeConstructor} Base
 */
export default function OriCommandTransform(Base) {
  return class OriCommand extends Base {
    async get(key) {
      let value = await super.get(key);

      if (value === undefined) {
        if (
          key === undefined ||
          typeof key !== "string" ||
          !key.startsWith?.("!")
        ) {
          return undefined;
        }
        // Key is an Origami command; invoke it.
        const ambientsTree = new ObjectTree({
          "@current": this,
        });
        ambientsTree[keySymbol] = "ori command";
        const extendedScope = new Scope(ambientsTree, Scope.getScope(this));
        const source = key.slice(1).trim();
        value = await ori.call(extendedScope, source);

        // Ensure this transform is applied to any subtree.
        if (
          Tree.isAsyncTree(value) &&
          !isTransformApplied(OriCommandTransform, value)
        ) {
          value = transformObject(OriCommandTransform, value);
        }
      }

      return value;
    }
  };
}
