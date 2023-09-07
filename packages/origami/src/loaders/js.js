import { GraphHelpers } from "@graphorigami/core";
import DeferredGraph from "../common/DeferredGraph.js";
import StringWithGraph from "../common/StringWithGraph.js";

/**
 * Load a .js file as a String with a toFunction() method that returns a
 * function that invokes the module's default export, and a toGraph() method
 * that returns a graph for the module's default export.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").HasGraph} HasGraph
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @returns {HasGraph}
 * @this {AsyncDictionary|null}
 */
export default function loadJs(buffer, key) {
  const containerGraph = this;

  let moduleExport;
  async function importModule() {
    if (!moduleExport && containerGraph && "import" in containerGraph) {
      moduleExport = await /** @type {any} */ (containerGraph).import?.(key);
    }
    return moduleExport;
  }

  /** @type {any} */
  const moduleWithGraph = new StringWithGraph(
    buffer,
    new DeferredGraph(async () => importModule())
  );

  moduleWithGraph.toFunction = () => {
    /** @this {AsyncDictionary} */
    return async function (...args) {
      const fn = await importModule();
      const target = typeof fn === "function" ? fn.bind(this) : fn;
      // HACK
      if (args.length === 0) {
        args.push(undefined);
      }
      return GraphHelpers.traverseOrThrow(target, ...args);
    };
  };

  return moduleWithGraph;
}
