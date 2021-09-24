import Compose from "../common/Compose.js";
import ExplorableGraph from "../core/ExplorableGraph.js";

const plusPrefix = "+";

export default function PlusKeysMixin(Base) {
  return class PlusKeys extends Base {
    // Define constructor so TypeScript knows constructor can accept arguments.
    constructor(...args) {
      super(...args);
    }

    async get(key, ...rest) {
      let result = await super.get(key);

      if (ExplorableGraph.isExplorable(result) && !isPlusKey(key)) {
        // Value is explorable; see if it has a plus value.
        const plusKey = `${plusPrefix}${key}`;
        const plusValue = await super.get(plusKey);
        if (plusValue !== undefined) {
          // Found plus value; compose this with actual value.
          // The result should itself support plus keys to handle nesting.
          result = new (PlusKeysMixin(Compose))(result, plusValue);
        }
      }

      result =
        ExplorableGraph.isExplorable(result) && rest.length > 0
          ? await result.get(...rest)
          : result;

      return result;
    }
  };
}

function isPlusKey(key) {
  return key.startsWith(plusPrefix);
}
