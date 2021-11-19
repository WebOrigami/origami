import ExplorableGraph from "../core/ExplorableGraph.js";

const scopeKey = Symbol("scope");
const inheritsScopeKey = Symbol("inheritsScope");

export default function InheritScopeMixin(Base) {
  return class InheritScope extends Base {
    constructor(...args) {
      super(...args);
      this.scope = null;
      this.inheritsScope = true;
    }

    async get(key) {
      // Try local graph first.
      let value = await super.get(key);
      if (value === undefined) {
        // Wasn't found in local graph, try inherited scope.
        value = await this.scope?.get(key);
      }
      if (ExplorableGraph.isExplorable(value) && value.inheritsScope) {
        // This graph becomes the scope for the subgraph.
        value.scope = this;
      }
      return value;
    }

    get inheritsScope() {
      return this[inheritsScopeKey];
    }
    set inheritsScope(inheritsScope) {
      this[inheritsScopeKey] = inheritsScope;
    }

    get scope() {
      return this[scopeKey];
    }
    set scope(scope) {
      this[scopeKey] = scope;
    }
  };
}
