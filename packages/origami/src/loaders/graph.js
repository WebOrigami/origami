/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import TextWithContents from "../common/TextWithContents.js";
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
  return new TextWithContents(buffer, async () => {
    const fn = compile.graphDocument(String(buffer));
    const graph = await fn.call(scope);
    graph[keySymbol] = key;
    return graph;
  });
}
