import ori from "../builtins/ori.js";
import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { isTransformApplied, transformObject } from "../core/utilities.js";
import { getScope } from "./scopeUtilities.js";

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
        const extendedScope = new Scope(
          {
            "@defaultGraph": this,
          },
          getScope(this)
        );
        const source = key.slice(1).trim();
        value = await ori.call(extendedScope, source);

        // Since this transform is for diagnostic purposes, prefer explorable
        // results.
        if (
          !ExplorableGraph.isExplorable(value) &&
          ExplorableGraph.canCastToExplorable(value)
        ) {
          value = ExplorableGraph.from(value);
        }
      }

      // Ensure this transform is applied to any explorable result.
      if (
        ExplorableGraph.isExplorable(value) &&
        !isTransformApplied(OriCommandTransform, value)
      ) {
        value = transformObject(OriCommandTransform, value);
      }

      return value;
    }
  };
}
