import ExplorableGraph from "../core/ExplorableGraph.js";

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
      } else if (ExplorableGraph.isExplorable(value) && value.inheritsScope) {
        // This graph becomes the scope for the subgraph.
        value.scope = this;
      }
      return value;
    }
  };
}
