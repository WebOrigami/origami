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
    }

    // async traverse(key, ...rest) {
    //   let value = await super.traverse(key, ...rest);
    //   if (value !== undefined) {
    //     return value;
    //   } else if (
    //     key === undefined ||
    //     typeof key !== "string" ||
    //     !key.startsWith?.("!")
    //   ) {
    //     return undefined;
    //   }

    //   const extendedScope = new Scope(
    //     {
    //       "@defaultGraph": this,
    //     },
    //     getScope(this)
    //   );
    //   const source = key.slice(1).trim();
    //   value = await ori.call(extendedScope, source);

    //   if (ExplorableGraph.canCastToExplorable(value) && rest.length > 0) {
    //     value = ExplorableGraph.traverse(value, ...rest);
    //   }

    //   return value;
    // }
  };
}
