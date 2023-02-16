import { keySymbol } from "../core/utilities.js";
import OrigamiGraph from "../framework/OrigamiGraph.js";

/**
 * Load a file as an Origami graph.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadGraph(buffer, key) {
  const text = String(buffer);
  const textWithGraph = new String(text);

  const scope = this;
  let graph;

  /** @type {any} */ (textWithGraph).toGraph = () => {
    if (!graph) {
      graph = new OrigamiGraph(text);
      graph.parent = scope;
      graph[keySymbol] = key;
    }
    return graph;
  };

  return textWithGraph;
}
