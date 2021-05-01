import ExplorableGraph from "./ExplorableGraph.js";

const wildcardPrefix = ":";

export const paramsKey = Symbol("params");

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
    // First see if any graph has an existing value with the desired key.
    let value;
    for (const graph of this.graphs) {
      value = await graph.get(key);
      if (value !== undefined) {
        if (value instanceof Function) {
          // The existing value is a function. We bind it to the graph that had
          // the key, and give it the graph's params.
          value = value.bind(graph, graph[paramsKey]);
        }
        break;
      }
    }

    const isRealValueExporable =
      !this.isWildcardKey(key) && value instanceof ExplorableGraph;

    if (value === undefined || isRealValueExporable) {
      // Didn't find the desired value in our graphs; try wildcards.
      // Alternatively, if we have an explorable real value and all the wildcard
      // values are exploralble, we'll want to compose them.
      const wildcards = await this.wildcards(key);
      const wildcardKeys = Object.keys(wildcards);
      if (wildcardKeys.length > 0) {
        // We have at least one wildcard value.
        const wildcardValues = Object.values(wildcards);
        const allWildcardsExplorable = wildcardKeys.every(
          (wildcardKey) => wildcards[wildcardKey] instanceof ExplorableGraph
        );
        if (allWildcardsExplorable) {
          // Compose the explorable wildcard values.
          const composeGraphs = wildcardValues;
          if (isRealValueExporable) {
            // Also include the existing real explorable value first.
            composeGraphs.unshift(value);
          }
          value = Reflect.construct(this.constructor, wildcardValues);
        } else if (value === undefined) {
          // The wildcards aren't all composable, so just take the first one.
          value = wildcardValues[0];
          if (value instanceof Function) {
            // The wildcard value is a function. As above, bind the function
            // to the graph that contained the value (this graph) and give
            // the function the graph's params. Augment the params with
            // the additional parameter supplied by the wildcard.
            const wildcardKey = wildcardKeys[0];
            const wildcardParams = addWildcardToParams(
              this[paramsKey],
              wildcardKey,
              key
            );
            value = value.bind(this, wildcardParams);
          }
        }
      }
    }

    if (rest.length > 0) {
      // Search deeper.
      const bindFunction = !(value instanceof WildcardGraph);
      value =
        value instanceof ExplorableGraph ? await value.get(...rest) : undefined;
      if (value instanceof Function && bindFunction) {
        // If the value we're returning is a function, bind it to this graph and
        // give it this graph's params. Exception: if we were searching inside
        // an instance of WildcardGraph, the result will already be bound to the
        // appropriate params. In that case, we *don't* bind.
        value = await value.bind(this, this[paramsKey]);
      }
    }

    return value;
  }

  isWildcardKey(key) {
    return key.startsWith(wildcardPrefix);
  }

  async wildcards(matchKey) {
    const result = {};
    for (const graph of this.graphs) {
      for await (const key of graph) {
        if (this.isWildcardKey(key) && key !== matchKey) {
          let value = await graph.get(key);
          if (value instanceof ExplorableGraph) {
            value = Object.create(value, {
              [paramsKey]: {
                value: addWildcardToParams(this[paramsKey], key, matchKey),
              },
            });
          }
          result[key] = value;
        }
      }
    }
    return result;
  }
}

function addWildcardToParams(params, wildcardKey, matchedKey) {
  const wildcardName = wildcardKey.slice(1);
  return Object.assign({}, params, {
    [wildcardName]: matchedKey,
  });
}
