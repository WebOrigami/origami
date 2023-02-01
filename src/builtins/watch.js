import ExplorableGraph from "../core/ExplorableGraph.js";
import ObjectGraph from "../core/ObjectGraph.js";

/**
 * Let a graph (e.g., of files) respond to changes.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 * @param {Invocable} [fn]
 */
export default async function watch(variant, fn) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }

  // Watch the indicated graph.
  /** @type {any} */
  const container = ExplorableGraph.from(variant);
  await /** @type {any} */ (container).watch?.();

  // // Watch graphs in scope.
  // const scope = /** @type {any} */ (container).scope;
  // await scope?.watch?.();

  if (fn === undefined) {
    return container;
  }

  // The caller supplied a function to reevaluate whenever the graph changes.
  let graph = await evaluateGraph(container.scope, fn);

  // We want to return a stable reference to the graph, so we'll use a prototype
  // chain that will always point to the latest graph. We'll extend the graph's
  // prototype chain with an empty object, and hand that object to the caller as
  // an indirect pointer.
  const indirect = Object.create(graph);

  // Reevaluate the function whenever the graph changes.
  container.addEventListener?.("change", async () => {
    const graph = await evaluateGraph(container.scope, fn);
    // Update the indirect pointer.
    Object.setPrototypeOf(indirect, graph);
  });

  return indirect;
}

async function evaluateGraph(scope, fn) {
  const result = await fn.call(scope);
  let graph = result ? ExplorableGraph.from(result) : undefined;
  if (!graph) {
    console.warn(`warning: watch expression did not return a graph`);
    // Return an empty graph.
    graph = new ObjectGraph({});
  }
  return graph;
}

watch.usage = `watch <folder>, [expr]\tLet a folder graph respond to changes`;
watch.documentation = "https://graphorigami.org/cli/builtins.html#watch";
