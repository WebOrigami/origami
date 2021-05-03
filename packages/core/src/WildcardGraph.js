import Compose from "./Compose.js";
import ExplorableGraph from "./ExplorableGraph.js";

const wildcardPrefix = ":";

export default class WildcardGraph extends ExplorableGraph {
  constructor(inner, params = []) {
    super();
    this.inner = new ExplorableGraph(inner);
    this.params = params;
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
}

async function search(graph, params, key, ...rest) {
  let result;
  let firstWildcardKey;
  let firstWildcardValue;
  let allWildcardsExplorable = true;
  const explorableValues = [];

  for await (const innerKey of graph) {
    const exactMatch = innerKey === key;
    const wildcardMatch = isWildcardKey(innerKey) && key !== innerKey;
    if (exactMatch || wildcardMatch) {
      // Key matched exactly or matched a wildcard.
      const innerValue = await graph.get(innerKey);
      if (innerValue) {
        if (innerValue instanceof ExplorableGraph) {
          // Add to explorable matches.
          explorableValues.push(innerValue);
        } else {
          if (wildcardMatch) {
            allWildcardsExplorable = false;
          }
          if (rest.length === 0) {
            if (exactMatch) {
              // Found
              result = innerValue;
              break;
            } else if (wildcardMatch && firstWildcardValue === undefined) {
              // Found first wildcard match, hold on to it in case we don't find an
              // exact match later.
              firstWildcardKey = key;
              firstWildcardValue = innerValue;
            }
          }
        }
      }
    }
  }

  const extendedParams = [key, ...params];

  if (result === undefined) {
    if (explorableValues.length > 0 && allWildcardsExplorable) {
      const compose =
        explorableValues.length > 1
          ? new Compose(...explorableValues)
          : explorableValues[0];
      result = new WildcardGraph(compose, extendedParams);
      if (rest.length > 0) {
        // Search deeper
        result = await search(result, params, ...rest);
      }
    } else if (rest.length === 0) {
      result = firstWildcardValue;
    }
  }

  if (result instanceof Function) {
    // Bind the result function to the graph and the key that matched.
    result = result.bind(graph, ...extendedParams);
  }

  return result;
}

function isWildcardKey(key) {
  return key.startsWith(wildcardPrefix);
}
