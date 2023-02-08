import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

/**
 * Load a .js file as a String with a toFunction() method that returns a
 * function that invokes the module's default export, and a toGraph() method
 * that returns a graph for the module's default export.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @returns {HasFunction & HasGraph}
 * @this {Explorable}
 */
export default function loadJs(buffer, key) {
  const text = String(buffer);
  /** @type {any} */
  const textWithFunction = new String(text);
  const graph = this;
  const scope = "scope" in graph ? graph.scope : graph;

  let moduleExport;
  async function importModule() {
    if (!moduleExport && "import" in graph) {
      moduleExport = /** @type {any} */ (graph).import(key);
    }
    return moduleExport;
  }

  textWithFunction.toFunction = function loadAndInvoke() {
    let fn;
    return async function (...args) {
      if (!fn) {
        fn = await importModule();
        if (
          typeof fn !== "function" &&
          ExplorableGraph.canCastToExplorable(fn)
        ) {
          fn = ExplorableGraph.toFunction(fn);
        }
      }
      return fn?.call(scope, ...args);
    };
  };

  textWithFunction.toGraph = function loadGraph() {
    let loadedGraph;
    return {
      async *[Symbol.asyncIterator]() {
        const loaded = await this.load();
        yield* loaded;
      },

      async get(key) {
        const loaded = await this.load();
        return loaded.get(key);
      },

      async load() {
        if (!loadedGraph) {
          const variant = await importModule();
          if (variant) {
            loadedGraph = ExplorableGraph.from(variant);
            if (!("parent" in loadedGraph)) {
              loadedGraph = transformObject(InheritScopeTransform, loadedGraph);
            }
            loadedGraph.parent = scope;
          }
        }
        return loadedGraph;
      },
    };
  };

  return textWithFunction;
}