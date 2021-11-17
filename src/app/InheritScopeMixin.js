import Compose from "../common/Compose.js";
import builtins from "../eg/builtins.js";
import { fallbackKey } from "./FallbackMixin.js";

const scopeKey = Symbol("scope");

export default function InheritScopeMixin(Base) {
  return class InheritScope extends Base {
    constructor(...args) {
      super(...args);

      // Default scope is builtins and the graph itself.
      this.scope = new Compose(this, builtins);
    }

    constructSubgraph(key, dictionary) {
      const subgraph = super.constructSubgraph(key, dictionary);

      // Fallback folders don't inherit scope.
      if (key !== fallbackKey) {
        // Compose the current graph onto the scope and set it as the scope for
        // the subgraph.
        subgraph.scope = new Compose(subgraph, this.scope);
      }

      return subgraph;
    }

    get scope() {
      return this[scopeKey];
    }
    set scope(scope) {
      this[scopeKey] = scope;
    }
  };
}
