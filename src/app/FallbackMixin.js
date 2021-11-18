import Compose from "../common/Compose.js";
import ExplorableGraph from "../core/ExplorableGraph.js";

export const fallbackKey = "+";
const fallbacksGraph = Symbol("fallbacksGraph");
const inheritedFallbacksGraph = Symbol("inheritedFallbacksGraph");

export default function FallbackMixin(Base) {
  return class Fallback extends Base {
    constructor(...args) {
      super(...args);
      this[fallbacksGraph] = undefined;
      this[inheritedFallbacksGraph] = undefined;
    }

    // async *[Symbol.asyncIterator]() {
    //   yield* super[Symbol.asyncIterator]();
    //   const fallbacks = await this.getFallbacks();
    //   if (fallbacks) {
    //     yield* fallbacks;
    //   }
    // }

    async fallbacks() {
      if (this[fallbacksGraph] === undefined) {
        const inherited = this.inheritedFallbacks;
        const fallbackVariant = await this.get(fallbackKey);
        const local = fallbackVariant
          ? ExplorableGraph.from(fallbackVariant)
          : null;
        let fallbacks;
        if (local && inherited) {
          fallbacks = new Compose(local, inherited);
        } else if (local) {
          fallbacks = local;
        } else if (inherited) {
          fallbacks = inherited;
        } else {
          fallbacks = null;
        }
        this[fallbacksGraph] = fallbacks;
      }
      return this[fallbacksGraph];
    }

    get inheritedFallbacks() {
      return this[inheritedFallbacksGraph];
    }
    set inheritedFallbacks(fallbacks) {
      this[inheritedFallbacksGraph] = fallbacks;
    }

    async get(key) {
      let result = await super.get(key);
      if (result !== undefined) {
        if (key !== fallbackKey && result instanceof this.constructor) {
          result.inheritedFallbacks = await this.fallbacks();
        }
        return result;
      }

      // Don't look for fallbacks for the fallback key.
      if (key === fallbackKey) {
        return undefined;
      }

      // Not found locally, check local and inherited fallbacks.
      const fallbacks = await this.fallbacks();
      result = await fallbacks?.get(key);
      if (result !== undefined) {
        return result;
      }

      return undefined;
    }

    // Reset memoized values when the underlying graph changes.
    onChange(eventType, filename) {
      if (super.onChange) {
        super.onChange(eventType, filename);
      }
      this[fallbacksGraph] = undefined;
      this[inheritedFallbacksGraph] = undefined;
    }
  };
}
