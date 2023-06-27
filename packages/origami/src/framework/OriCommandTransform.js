/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { GraphHelpers, ObjectGraph } from "@graphorigami/core";
import ori from "../builtins/@ori.js";
import Scope from "../common/Scope.js";
import {
  getScope,
  isTransformApplied,
  keySymbol,
  transformObject,
} from "../core/utilities.js";

/**
 * Add support for commands prefixed with `!`.
 *
 * E.g., asking this graph for `!yaml` will invoke the yaml() builtin function
 * in the context of this graph.
 *
 * @typedef {import("../..").Constructor<AsyncDictionary>} AsyncDictionaryConstructor
 * @param {AsyncDictionaryConstructor} Base
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
        const ambientsGraph = new ObjectGraph({
          "@current": this,
        });
        ambientsGraph[keySymbol] = "ori command";
        const extendedScope = new Scope(ambientsGraph, getScope(this));
        const source = key.slice(1).trim();
        value = await ori.call(extendedScope, source);

        // Ensure this transform is applied to any explorable result.
        if (
          GraphHelpers.isAsyncDictionary(value) &&
          !isTransformApplied(OriCommandTransform, value)
        ) {
          value = transformObject(OriCommandTransform, value);
        }
      }

      return value;
    }
  };
}
