import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Let a graph (e.g., of files) respond to changes.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function watch2(variant, fn) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }

  // Watch the indicated graph.
  const container = ExplorableGraph.from(variant);
  await /** @type {any} */ (container).watch?.();

  // // Watch graphs in scope.
  // const scope = /** @type {any} */ (graph).scope;
  // await scope?.watch?.();

  let graph = await evaluateGraph(container.scope, fn);

  container.addEventListener?.("change", async () => {
    graph = await evaluateGraph(container.scope, fn);
  });

  return {
    async *[Symbol.asyncIterator]() {
      yield* graph ?? [];
    },

    async get(key) {
      return graph?.get(key);
    },
  };
}

async function evaluateGraph(scope, fn) {
  try {
    const result = await fn.call(scope);
    const graph = ExplorableGraph.from(result);
    return graph;
  } catch (error) {
    return undefined;
  }
}
