import ExplorableGraph from "./ExplorableGraph.js";

const wildcardPrefix = ":";

export default function WildcardKeysMixin(Base) {
  return class WildcardKeys extends Base {
    async get(key, ...rest) {
      let bindTarget = this;
      const explorableValues = [];

      // Try key directly.
      let value = await super.get(key);

      if (value === undefined || value instanceof ExplorableGraph) {
        // Consider all wildcards.
        if (value instanceof ExplorableGraph) {
          explorableValues.push(value);
        }
        for await (const wildcardKey of wildcards(this)) {
          if (wildcardKey !== key) {
            // We have a wildcard that matches.
            const wildcardValue = await super.get(wildcardKey);
            if (wildcardValue !== undefined) {
              if (wildcardValue instanceof ExplorableGraph) {
                const parameterized = parameterize(
                  wildcardValue,
                  wildcardKey,
                  key
                );
                explorableValues.push(parameterized);
              } else if (explorableValues.length === 0) {
                // First wildcard found is not explorable; use that value.
                value = wildcardValue;
                bindTarget = parameterize(this, wildcardKey, key);
                break;
              }
            }
          }
        }

        if (explorableValues.length > 0) {
          value =
            explorableValues.length > 1
              ? new WildcardGraphs(...explorableValues)
              : explorableValues[0];
        }
      }

      if (value instanceof Function) {
        // Bind the function to the graph.
        value = await value.call(bindTarget, ...rest);
      } else if (value instanceof ExplorableGraph && rest.length > 0) {
        value = await value.get(...rest);
      }

      return value;
    }

    get params() {
      return {};
    }
  };
}

class WildcardGraphs extends ExplorableGraph {
  constructor(...graphs) {
    super();
    this.graphs = graphs;
  }

  async *[Symbol.asyncIterator]() {
    // Use Set to de-duplicate keys.
    const set = new Set();

    for await (const graph of this.graphs) {
      for await (const key of graph[Symbol.asyncIterator]()) {
        if (!set.has(key)) {
        }
        set.add(key);
        yield key;
      }
    }
  }

  async get(key, ...rest) {
    let value;
    let bindTarget;
    const explorableValues = [];

    // Try key directly.
    for await (const graph of this.graphs) {
      value = await graph.get(key);
      if (value !== undefined) {
        break;
      }
    }

    if (value === undefined || value instanceof ExplorableGraph) {
      // Consider all wildcards.
      if (value instanceof ExplorableGraph) {
        explorableValues.push(value);
      }
      outer: for await (const graph of this.graphs) {
        bindTarget = graph;
        for await (const wildcardKey of wildcards(graph)) {
          if (wildcardKey !== key) {
            // We have a wildcard that matches.
            const wildcardValue = await graph.get(wildcardKey);
            if (wildcardValue !== undefined) {
              if (wildcardValue instanceof ExplorableGraph) {
                const parameterized = parameterize(
                  wildcardValue,
                  wildcardKey,
                  key
                );
                explorableValues.push(parameterized);
              } else if (explorableValues.length === 0) {
                // First wildcard found is not explorable; use that value.
                value = wildcardValue;
                bindTarget = parameterize(graph, wildcardKey, key);
                break outer;
              }
            }
          }
        }
      }
    }

    if (explorableValues.length > 0) {
      value =
        explorableValues.length > 1
          ? new WildcardGraphs(...explorableValues)
          : explorableValues[0];
    }

    if (value instanceof Function) {
      // Bind the function to the graph.
      value = await value.call(bindTarget, ...rest);
    } else if (value instanceof ExplorableGraph && rest.length > 0) {
      value = await value.get(...rest);
    }

    return value;
  }
}

function isWildcardKey(key) {
  return key.startsWith(wildcardPrefix);
}

function parameterize(obj, wildcard, match) {
  const wildcardName = wildcard.slice(1);
  const params = Object.assign({}, obj.params, {
    [wildcardName]: match,
  });
  return Object.create(obj, {
    params: {
      config: true,
      enumerable: false,
      value: params,
    },
  });
}

async function* wildcards(graph) {
  for await (const key of graph[Symbol.asyncIterator]()) {
    if (isWildcardKey(key)) {
      yield key;
    }
  }
}
