import { ObjectGraph } from "@graphorigami/core";
import { isPlainObject, keySymbol } from "../common/utilities.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import DeferredGraph from "./DeferredGraph.js";
import ExpressionGraph from "./ExpressionGraph.js";
import StringWithGraph from "./StringWithGraph.js";
import { extractFrontMatter } from "./serialize.js";

/**
 * Load a file as text with possible front matter.
 *
 * If the text starts with `---`, the loader attempts to parse the front matter.
 * If successful, the document will be returned as a String with an attached
 * graph with the front matter and document content as data.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").StringLike} StringLike
 *
 * @param {StringLike} input
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadTextWithFrontMatter(input, key) {
  /** @type {any} */
  let text;

  const attachedGraph =
    typeof input === "object" && /** @type {any} */ (input).toGraph?.();

  const { bodyText, frontData } = extractFrontMatter(input);
  if (frontData) {
    const scope = this;

    const deferredGraph = new DeferredGraph(() => {
      const graphClass = containsExpression(frontData)
        ? ExpressionGraph
        : ObjectGraph;
      const graph = new (FileTreeTransform(graphClass))(frontData);
      if (scope) {
        graph.parent = scope;
      }
      // @ts-ignore
      graph[keySymbol] = key;
      return graph;
    });

    text = new StringWithGraph(input, deferredGraph);
    text.frontData = frontData;
    text.bodyText = bodyText;
  } else if (attachedGraph) {
    // Input has graph; attach that to the text.
    text = new StringWithGraph(input, attachedGraph);
    text.bodyText = text;
  } else {
    text = String(input);
  }

  return text;
}

// Return true if the given graph contains an expression
function containsExpression(obj) {
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "function") {
      return true;
    } else if (isPlainObject(value)) {
      const valueContainsExpression = containsExpression(value);
      if (valueContainsExpression) {
        return true;
      }
    }
  }
  return false;
}
