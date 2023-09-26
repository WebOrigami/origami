import { Graph, ObjectGraph } from "@graphorigami/core";
import { isPlainObject, keySymbol, stringLike } from "../common/utilities.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import DeferredGraph from "./DeferredGraph.js";
import ExpressionGraph from "./ExpressionGraph.js";
import { extractFrontMatter } from "./serialize.js";

/**
 * Load a file as text with possible front matter.
 *
 * If the text starts with `---`, the loader attempts to parse the front matter.
 * If successful, the document will be returned as a String with an attached
 * graph with the front matter and document text as `contents`.
 *
 * If the input is not a string or Buffer, or already has `contents`, it is
 * returned as is.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").StringLike} StringLike
 *
 * @param {any} input
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadTextWithFrontMatter(input, key) {
  if (!stringLike(input) || input.contents) {
    // Has already been processed; return as is.
    return input;
  }

  const { bodyText, frontData } = extractFrontMatter(input);
  if (!frontData) {
    // No front matter; return plain string.
    return String(input);
  }

  // Return plain text as default value of contents graph.
  // @ts-ignore
  frontData[Graph.defaultValueKey] = bodyText;

  const scope = this;
  /** @type {any} */
  const textFile = new String(bodyText);
  textFile.contents = () => {
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
  };

  // TODO: Remove once we're no longer using toGraph.
  textFile.toGraph = () => new DeferredGraph(() => textFile.contents());
  return textFile;
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
