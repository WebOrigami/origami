import ori from "../builtins/ori.js";
import Scope from "../common/Scope.js";
import { getScope } from "./scopeUtilities.js";

export default function OriCommandTransform(Base) {
  return class OriCommand extends Base {
    async get(key) {
      let value = await super.get(key);

      if (value !== undefined) {
        return value;
      } else if (
        key === undefined ||
        typeof key !== "string" ||
        !key.startsWith?.("!")
      ) {
        return undefined;
      }

      const extendedScope = new Scope(
        {
          "@defaultGraph": this,
        },
        getScope(this)
      );

      const source = key.slice(1).trim();

      value = await ori.call(extendedScope, source);
      return value;

      // async function fn() {
      //   const extendedScope = new Scope(
      //     {
      //       "@defaultGraph": this,
      //     },
      //     getScope(this)
      //   );
      //   let result = await ori.call(extendedScope, source);
      //   if (
      //     !ExplorableGraph.isExplorable(result) &&
      //     ExplorableGraph.canCastToExplorable(result)
      //   ) {
      //     result = ExplorableGraph.from(result);
      //     result = transformObject(InheritScopeTransform, result);
      //     result.parent = extendedScope;
      //   }
      //   return result;
      // }

      // return fn;
    }
  };
}
