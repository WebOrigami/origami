import Compose from "./Compose.js";
import ExplorableGraph from "./ExplorableGraph.js";

const wildcardPrefix = ":";

export default class WildcardGraph extends ExplorableGraph {
  constructor(inner) {
    super();
    this.inner = new ExplorableGraph(inner);
  }

  async *[Symbol.asyncIterator]() {
    // Yield keys that aren't wildcard keys.
    for await (const key of this.inner) {
      if (!this.isWildcardKey(key)) {
        yield key;
      }
    }
  }

  async get(key, ...rest) {
    // First see if inner graph has an existing value with those keys.
    const existingValue = await this.inner.get(key);
    if (
      existingValue !== undefined &&
      !(existingValue instanceof ExplorableGraph)
    ) {
      return existingValue;
    }

    // If we have wildcards, try them.
    const subgraphs = [];
    if (existingValue instanceof ExplorableGraph) {
      subgraphs.push(existingValue);
    }
    let allSubgraphsExplorable = true;
    for await (const key of this.inner) {
      if (this.isWildcardKey(key)) {
        const value = await this.inner.get(key);
        subgraphs.push(value);
        if (!(value instanceof ExplorableGraph)) {
          allSubgraphsExplorable = false;
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
        : Reflect.construct(this.constructor, [new Compose(...subgraphs)]);
    return rest.length === 0 ? composed : await composed.get(...rest);
  }

  isWildcardKey(key) {
    return key.startsWith(wildcardPrefix);
  }
}
