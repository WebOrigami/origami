import ExplorableGraph from "../core/ExplorableGraph.js";

export default function InheritScopeTransform(Base) {
  return class InheritScope extends Base {
    constructor(...args) {
      super(...args);
      this.scope = null;
      this.inheritsScope = true;
      this.isInScope = false;
    }

    async get(key) {
      // Try local graph first.
      let value = await super.get(key);
      if (value === undefined) {
        // Wasn't found in local graph, try inherited scope.
        value = await this.scope?.get(key);
      } else if (ExplorableGraph.isExplorable(value) && value.inheritsScope) {
        // This graph becomes the scope for the subgraph.

        // Add an indicator that, from the perspective of the subgraph, this
        // graph is in scope. We use a prototype extension to do this, because
        // we don't want to directly modifiy this graph.
        const scopeWrapper = {
          isInScope: true,
        };
        Object.setPrototypeOf(scopeWrapper, this);

        value.scope = scopeWrapper;
      }
      return value;
    }
  };
}
