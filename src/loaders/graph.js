import DeferredGraph from "../common/DeferredGraph.js";
import StringWithGraph from "../common/StringWithGraph.js";
import { keySymbol } from "../core/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load a file as an Origami graph.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadGraph(buffer, key) {
  const text = String(buffer);
  const scope = this;
  const deferredGraph = new DeferredGraph(async () => {
    const fn = compile.graphDocument(text);
    const graph = await fn.call(scope);
    graph[keySymbol] = key;
    return graph;
  });
  return new StringWithGraph(text, deferredGraph);
}
