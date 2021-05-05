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
      if (!isWildcardKey(key)) {
        yield key;
      }
    }
  }

  async get(...path) {
    return await search(this.inner, this.params, ...path);
  }

  get params() {
    return {};
  }
}

async function search(graph, params, key, ...rest) {
  let bindTarget = graph;
  const explorableValues = [];

  // Try key directly.
  let value = await graph.get(key);

  if (value === undefined || value instanceof ExplorableGraph) {
    // Consider all wildcards.
    if (value instanceof ExplorableGraph) {
      explorableValues.push(value);
    }
    for await (const wildcardKey of wildcards(graph)) {
      // We have a wildcard that matches.
      const wildcardValue = await graph.get(wildcardKey);
      if (wildcardValue !== undefined) {
        if (wildcardValue instanceof ExplorableGraph) {
          const parameterized = parameterize(wildcardValue, wildcardKey, key);
          explorableValues.push(parameterized);
        } else if (explorableValues.length === 0) {
          // First wildcard found is not explorable; use that value.
          value = wildcardValue;
          bindTarget = parameterize(graph, wildcardKey, key);
          break;
        }
      }
    }

    if (explorableValues.length > 0) {
      const compose =
        explorableValues.length > 1
          ? new Compose(...explorableValues)
          : explorableValues[0];
      value = new WildcardGraph(compose);
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
  for await (const key of graph) {
    if (isWildcardKey(key)) {
      yield key;
    }
  }
}
