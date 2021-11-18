import Compose from "../common/Compose.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ComposeFallbacks from "./ComposeFallbacks.js";

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

    async fallbacks() {
      if (this[fallbacksGraph] === undefined) {
        // Get inherited fallbacks.
        const inherited = this.inheritedFallbacks;

        // Get local fallbacks.
        let local;
        const fallbackVariant = await super.get(fallbackKey);
        if (fallbackVariant) {
          local = ExplorableGraph.from(fallbackVariant);

          // Add this folder to the local fallback's scope so that it can
          // reference values inside this folder.
          local.scope = local.scope
            ? new Compose(this.scope, local.scope)
            : this.scope;
        }

        // Merge as appropriate.
        let fallbacks;
        if (local && inherited) {
          fallbacks = new ComposeFallbacks(local, inherited);
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
        if (
          key !== fallbackKey &&
          result instanceof Object &&
          "inheritedFallbacks" in result
        ) {
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
