import ExplorableGraph from "./ExplorableGraph.js";

const wildcardPrefix = ":";

export const paramsKey = Symbol("params");

export default class WildcardGraph extends ExplorableGraph {
  constructor(...graphs) {
    super();
    this.graphs = graphs.map((graph) => new ExplorableGraph(graph));
  }

  addParams(graph, paramsToAdd) {
    const params = Object.assign({}, this[paramsKey], paramsToAdd);
    const result = Object.create(graph, {
      [paramsKey]: {
        value: params,
      },
    });
    return result;
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
    // First see if any graph has an existing value with the desired key.
    let value;
    for (const graph of this.graphs) {
      value = await graph.get(key);
      if (value !== undefined) {
        if (value instanceof Function) {
          // Bind the function to the graph that had the key, and give it the
          // graph's params.
          value = value.bind(graph, graph[paramsKey]);
        }
        break;
      }
    }

    const isRealExplorableValue =
      !this.isWildcardKey(key) && value instanceof ExplorableGraph;

    if (value === undefined || isRealExplorableValue) {
      // Didn't find value in our graphs; try wildcards.
      // Alternatively, if we have an explorable real value and all the wildcard
      // values are exploralble, we'll want to compose them.
      const wildcards = await this.wildcards(key);
      const wildcardKeys = Object.keys(wildcards);

      // real value not explorable => use it
      // real value explorable, no wildcards => ditto
      // real value explorable, not all wildcards explorable => ditto
      // real value explorable, all (>0) wildcards explorable => compose
      // no real value, only one wildcard => use first one, parameterize
      // no real value, all (>0) wildcards explorable => compose
      // no real value, no wildcards => undefined

      if (wildcardKeys.length > 0) {
        // We have at least one wildcard value.
        const wildcardValues = Object.values(wildcards);
        const allWildcardsExplorable = wildcardKeys.every(
          (wildcardKey) => wildcards[wildcardKey] instanceof ExplorableGraph
        );
        if (value === undefined) {
          if (!allWildcardsExplorable) {
            value = wildcardValues[0];
            // Use first wildcard.
            if (value instanceof Function) {
              // Add the matching wildcard to the params.
              const wildcardKey = wildcardKeys[0];
              const wildcardName = wildcardKey.slice(1);
              const wildcardParams = Object.assign({}, this.params, {
                [wildcardName]: key,
              });
              value = value.bind(this, wildcardParams);
            }
          } else {
            // Compose explorable wildcard values.
            value = Reflect.construct(this.constructor, wildcardValues);
          }
        } else if (isRealExplorableValue && allWildcardsExplorable) {
          // Compose explorable real value and explorable wildcard values.
          value = Reflect.construct(this.constructor, [
            value,
            ...wildcardValues,
          ]);
        }
      }
    }

    if (rest.length > 0) {
      value = await value.get(...rest);
    }

    if (value instanceof Function) {
      value = await value.bind(this);
    }

    return value;
  }

  isWildcardKey(key) {
    return key.startsWith(wildcardPrefix);
  }

  get params() {
    return this[paramsKey] || {};
  }

  async wildcards(matchKey) {
    const result = {};
    for (const graph of this.graphs) {
      for await (const key of graph) {
        if (this.isWildcardKey(key) && key !== matchKey) {
          let value = await graph.get(key);
          if (value instanceof ExplorableGraph) {
            const wildcardName = key.slice(1);
            value = this.addParams(value, {
              [wildcardName]: matchKey,
            });
          }
          result[key] = value;
        }
      }
    }
    return result;
  }
}
