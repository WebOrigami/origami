import Compose from "../common/Compose.js";
import ExplorableGraph from "../core/ExplorableGraph.js";

const parentKey = Symbol("parent");

export default function InheritScopeTransform(Base) {
  return class InheritScope extends Base {
    constructor(...args) {
      super(...args);
      this.isInScope = false;
      this[parentKey] = null;
    }

    async get(key) {
      const value = await super.get(key);
      if (ExplorableGraph.isExplorable(value) && !value.parent) {
        // This graph becomes the parent for all subgraphs.

        // REVIEW: Confirm this resolves our scoping issue.
        value.parent = markInScope(this);
      }
      return value;
    }

    async formulas() {
      const base = (await super.formulas?.()) ?? [];
      if (this.parent) {
        const parentFormulas = (await this.parent.formulas?.()) ?? [];
        const inherited = parentFormulas.filter(
          (formula) => formula.inheritable
        );
        // Inherited formulas are lower priority, so come last.
        return [...base, ...inherited];
      }
      return base;
    }

    get parent() {
      return this[parentKey];
    }
    set parent(parent) {
      this[parentKey] = parent;
    }

    get scope() {
      const parent = this.parent;
      if (parent) {
        // Add parent to this graph's scope.
        const parentScopeWrapper = markInScope(parent?.scope ?? parent);
        return new Compose(this, parentScopeWrapper);
      } else {
        // Scope is just the graph itself.
        return this;
      }
    }
  };
}

// Add a wrapper to indicate that, from the perspective of the subgraph, the
// parent is in scope. We use a prototype extension to do this, because we don't
// want to directly modifiy the parent graph.
function markInScope(graph) {
  if (graph.isInScope) {
    return graph;
  }
  const scopeWrapper = {
    isInScope: true,
  };
  Object.setPrototypeOf(scopeWrapper, graph);
  return scopeWrapper;
}
