import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Given a graph, take the first n items from it.
 *
 * @param {GraphVariant} variant
 * @param {number} n
 * @this {Explorable}
 */
export default async function take(variant, n) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  return {
    async *[Symbol.asyncIterator]() {
      const iterator = graph[Symbol.asyncIterator]();
      for (let i = 0; i < n; i++) {
        const item = await iterator.next();
        if (item.done) {
          break;
        }
        yield item.value;
      }
    },

    async get(key) {
      return graph.get(key);
    },
  };
}

take.usage = `take graph, n\tReturn the first n items from graph`;
take.documentation = "https://graphorigami.org/cli/builtins.html#take";
