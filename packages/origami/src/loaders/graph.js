/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { getScope, keySymbol } from "../common/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load a file as an Origami graph.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadGraph(buffer, key) {
  const scope = getScope(this);

  /** @type {any} */
  const graphFile = new String(buffer);
  graphFile.contents = async () => {
    const fn = compile.graphDocument(graphFile);
    const graph = await fn.call(scope);
    graph[keySymbol] = key;
    return graph;
  };
  return graphFile;
}
