import ExplorableGraph from "./ExplorableGraph.js";

const wildcardPrefix = ":";

export const params = Symbol("params");

export default class WildcardGraph extends ExplorableGraph {
  constructor(...graphs) {
    super();
    this.graphs = graphs.map((graph) => new ExplorableGraph(graph));
  }

  async *[Symbol.asyncIterator]() {
    // Yield keys that aren't wildcard keys.
    for (const graph of this.graphs) {
      for await (const key of graph) {
        if (!this.isWildcardKey(key)) {
          yield key;
        }
      }
    }
  }

  async get(key, ...rest) {
    // First see if any graph has an existing value with those keys.
    let existingValue;
    for (const graph of this.graphs) {
      existingValue = await graph.get(key);
      if (existingValue !== undefined) {
        break;
      }
    }

    const subgraphs = [];
    if (existingValue instanceof ExplorableGraph) {
      subgraphs.push(existingValue);
    } else if (existingValue !== undefined) {
      return existingValue;
    }

    // If we have wildcards, try them.
    let allSubgraphsExplorable = true;
    for (const graph of this.graphs) {
      for await (const key of graph) {
        if (this.isWildcardKey(key)) {
          const value = await graph.get(key);
          subgraphs.push(value);
          if (!(value instanceof ExplorableGraph)) {
            allSubgraphsExplorable = false;
          }
        }
      }
    }

    if (subgraphs.length === 0) {
      // No existing value, no wildcards.
      return undefined;
    }

    const composed =
      subgraphs.length === 1 || !allSubgraphsExplorable
        ? subgraphs[0] // No need to compose or can't compose; use as is.
        : Reflect.construct(this.constructor, subgraphs);

    if (value instanceof Function) {
      const fn = value;
      const value = () => {
        return fn(this, params);
      };
    }

    return rest.length === 0 ? composed : await composed.get(...rest);
  }

  isWildcardKey(key) {
    return key.startsWith(wildcardPrefix);
  }
}
