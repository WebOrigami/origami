import { GraphHelpers } from "@graphorigami/core";
import DeferredGraph from "../common/DeferredGraph.js";
import { getScope, graphInContext, keySymbol } from "../core/utilities.js";

/**
 * Load a .js file as a String with a toFunction() method that returns a
 * function that invokes the module's default export, and a toGraph() method
 * that returns a graph for the module's default export.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").HasGraph} HasGraph
 * @typedef {import("../core/types").HasFunction} HasFunction
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @returns {HasFunction & HasGraph}
 * @this {AsyncDictionary|null}
 */
export default function loadJs(buffer, key) {
  const text = String(buffer);
  /** @type {any} */
  const textWithFunction = new String(text);
  const graph = this;
  const scope = getScope(graph);

  let moduleExport;
  async function importModule() {
    if (!moduleExport && graph && "import" in graph) {
      moduleExport = await /** @type {any} */ (graph).import?.(key);
    }
    return moduleExport;
  }

  textWithFunction.toFunction = function loadAndInvoke() {
    let fn;
    return async function (...args) {
      if (!fn) {
        fn = await importModule();
      }
      return fn instanceof Function
        ? // Invoke the function
          await fn.call(scope, ...args)
        : // Traverse the graph.
          await GraphHelpers.traverseOrThrow(fn, ...args);
    };
  };

  const exportedGraph = new DeferredGraph(async () => {
    const variant = await importModule();
    if (!variant) {
      return null;
    }

    const loadedGraph = graphInContext(GraphHelpers.from(variant), scope);
    loadedGraph[keySymbol] = key;

    return loadedGraph;
  });

  textWithFunction.toGraph = () => exportedGraph;

  return textWithFunction;
}
