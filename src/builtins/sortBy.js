import extendValueKeyFn from "../common/extendValueKeyFn.js";
import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Return a new graph with the original's keys sorted using the given function.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 * @param {Invocable} sortKeyFn
 */
export default async function sortBy(variant, sortKeyFn) {
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const result = Object.create(graph);
  const extendedSortFn = extendValueKeyFn(sortKeyFn);

  result[Symbol.asyncIterator] = async function* () {
    const sorted = [];
    for await (const key of graph[Symbol.asyncIterator]()) {
      const value = await graph.get(key);
      const sortKey = await extendedSortFn.call(this, value, key);
      sorted.push({ key, sortKey });
    }
    sorted.sort((a, b) => {
      if (a.sortKey < b.sortKey) {
        return -1;
      }
      if (a.sortKey > b.sortKey) {
        return 1;
      }
      return 0;
    });
    const keys = sorted.map(({ key }) => key);
    yield* keys;
  };

  return result;
}

sortBy.usage = `sortBy graph, fn\tReturn a new graph sorting keys by the function`;
sortBy.documentation = "https://graphorigami.org/cli/builtins.html#sortBy";
