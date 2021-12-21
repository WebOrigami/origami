import Compose from "../common/Compose.js";
import ExplorableGraph from "../core/ExplorableGraph.js";

const parentKey = Symbol("parent");
const scopeKey = Symbol("scope");

export default function InheritScopeTransform(Base) {
  return class InheritScope extends Base {
    constructor(...args) {
      super(...args);
      this.isInScope = false;
      this[parentKey] = null;
      /** @type {any} */ this[scopeKey] = this;
    }

    async get(key) {
      const value = await super.get(key);
      if (ExplorableGraph.isExplorable(value)) {
        // This graph becomes the parent for all subgraphs.
        value.parent = this;
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

      if (parent) {
        // Add parent to this graph's scope.
        let parentScope = parent.scope ?? parent;

        // Add a wrapper to indicate that, from the perspective of the subgraph,
        // the parent is in scope. We use a prototype extension to do this,
        // because we don't want to directly modifiy the parent graph.
        const scopeWrapper = {
          isInScope: true,
        };
        Object.setPrototypeOf(scopeWrapper, parentScope);

        this[scopeKey] = new Compose(this, scopeWrapper);
      } else {
        this[scopeKey] = null;
      }
    }

    get scope() {
      return this[scopeKey];
    }
  };
}
