import Compose from "../common/Compose.js";

const scopeKey = Symbol("scope");

export default function InheritScopeMixin(Base) {
  return class InheritScope extends Base {
    constructor(...args) {
      super(...args);

      // Default scope is just the graph itself.
      this.scope = this;
    }

    constructSubgraph(dictionary) {
      const subgraph = super.constructSubgraph(dictionary);

      // Compose the current graph onto the scope and set it as the scope for
      // the subgraph.
      subgraph.scope = new Compose(subgraph, this.scope);

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
