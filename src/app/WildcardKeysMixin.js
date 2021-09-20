import ExplorableGraph from "../core/ExplorableGraph.js";

const wildcardPrefix = "[";
const wildcardSuffix = "]";

export default function WildcardKeysMixin(Base) {
  return class WildcardKeys extends Base {
    #params = {};

    async get(key, ...rest) {
      let bindTarget = this;
      const explorableValues = [];

      // Try key directly.
      let value = await super.get(key);

      if (value === undefined || ExplorableGraph.isExplorable(value)) {
        // Consider all wildcards.
        if (ExplorableGraph.isExplorable(value)) {
          explorableValues.push(value);
        }
        for await (const wildcardKey of wildcards(this)) {
          if (wildcardKey !== key) {
            // We have a wildcard that matches.
            const wildcardValue = await super.get(wildcardKey);
            if (wildcardValue !== undefined) {
              if (ExplorableGraph.isExplorable(wildcardValue)) {
                const parameterized = parameterize(
                  wildcardValue,
                  wildcardKey,
                  key
                );
                explorableValues.push(parameterized);
              } else if (explorableValues.length === 0) {
                // First wildcard found is not explorable; use that value.
                value = wildcardValue;
                // See concerns in comments for parameterize().
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
      } else if (ExplorableGraph.isExplorable(value) && rest.length > 0) {
        value = await value.get(...rest);
      }

      return value;
    }

    get params() {
      return this.#params;
    }
    set params(params) {
      this.#params = params;
    }
  };
}

// A collection of graphs that support wildcard keys.
// This is a type of value returned by WildcardKeysMixin (above) if the desired
// path results in multiple hits: e.g., a real value and some wildcard values.
class WildcardGraphs {
  constructor(...graphs) {
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

  // This code is similar to, but slightly different from, the `get` method
  // defined by WildcardKeysMixin. One challenge with sharing this code with
  // WildcardKeysMixin is that the latter must invoke the `super` get method,
  // while WildcardGraphs wants to invoke the normal get method.
  async get(key, ...rest) {
    let value;
    const explorableValues = [];

    // Try key directly.
    for await (const graph of this.graphs) {
      value = await graph.get(key);
      if (value !== undefined) {
        break;
      }
    }

    if (value === undefined || ExplorableGraph.isExplorable(value)) {
      // Consider all wildcards.
      if (value instanceof WildcardGraphs) {
        explorableValues.push(...value.graphs);
      } else if (ExplorableGraph.isExplorable(value)) {
        explorableValues.push(value);
      }
      outer: for await (const graph of this.graphs) {
        for await (const wildcardKey of wildcards(graph)) {
          if (wildcardKey !== key) {
            // We have a wildcard that matches.
            const wildcardValue = await graph.get(wildcardKey);
            if (wildcardValue !== undefined) {
              if (wildcardValue instanceof WildcardGraphs) {
                explorableValues.push(...wildcardValue.graphs);
              } else if (ExplorableGraph.isExplorable(wildcardValue)) {
                explorableValues.push(wildcardValue);
              } else if (explorableValues.length === 0) {
                // First wildcard found is not explorable; use that value.
                value = wildcardValue;
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
      // Function should already be bound.
      value = await value.call(null, ...rest);
    } else if (ExplorableGraph.isExplorable(value) && rest.length > 0) {
      value = await value.get(...rest);
    }

    return value;
  }
}

function isWildcardKey(key) {
  return key.startsWith(wildcardPrefix) && key.endsWith(wildcardSuffix);
}

// TODO: Revisit this parameterization method, which is too destructive and
// likely to lead to weird bugs.
function parameterize(obj, wildcard, match) {
  const wildcardName = wildcard.slice(1, -1);
  obj.params = Object.assign({}, obj.params, {
    [wildcardName]: match,
  });
  return obj;
}

async function* wildcards(graph) {
  for await (const key of graph[Symbol.asyncIterator]()) {
    if (isWildcardKey(key)) {
      yield key;
    }
  }
}
