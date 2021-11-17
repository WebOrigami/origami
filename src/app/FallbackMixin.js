import Compose from "../common/Compose.js";

const fallbackKey = "+";
const fallbacksGraph = Symbol("fallbacksGraph");
const inheritedFallbacksGraph = Symbol("inheritedFallbacksGraph");

export default function FallbackMixin(Base) {
  return class Fallback extends Base {
    constructor(...args) {
      super(...args);
      this[fallbacksGraph] = undefined;
      this[inheritedFallbacksGraph] = undefined;
    }

    async *[Symbol.asyncIterator]() {
      yield* super[Symbol.asyncIterator]();
      const fallbacks = await this.getFallbacks();
      if (fallbacks) {
        yield* fallbacks;
      }
    }

    async getFallbacks() {
      if (this[fallbacksGraph] === undefined) {
        const inherited = this.inheritedFallbacks;
        const local = await this.get(fallbackKey);
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
          result.inheritedFallbacks = await this.getFallbacks();
        }
        return result;
      }

      // Don't look for fallbacks for the fallback key.
      if (key === fallbackKey) {
        return undefined;
      }

      // Not found locally, check local and inherited fallbacks.
      const fallbacks = await this.getFallbacks();
      result = await fallbacks?.get(key);
      if (result !== undefined) {
        return result;
      }

      return undefined;
    }
  };
}
