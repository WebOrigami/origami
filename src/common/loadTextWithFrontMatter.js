import ObjectGraph from "../core/ObjectGraph.js";
import { extractFrontMatter, isPlainObject } from "../core/utilities.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import DeferredGraph from "./DeferredGraph.js";
import ExpressionGraph from "./ExpressionGraph.js";
import StringWithGraph from "./StringWithGraph.js";

/**
 * Load a file as text with possible front matter.
 *
 * If the text starts with `---`, the loader attempts to parse the front matter.
 * If successful, the document will be returned as a String with an attached
 * graph with the front matter and document content as data.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadTextWithFrontMatter(buffer, key) {
  const text = String(buffer);

  const frontMatter = extractFrontMatter(text);
  if (!frontMatter) {
    // Didn't find, or couldn't parse, front matter
    return text;
  }

  const { frontData, bodyText } = frontMatter;
  const scope = this;

  const deferredGraph = new DeferredGraph(() => {
    const graphClass = containsExpression(frontData)
      ? ExpressionGraph
      : ObjectGraph;
    const graph = new (FileTreeTransform(graphClass))(frontData);
    graph.parent = scope;
    return graph;
  });

  const textWithGraph = new StringWithGraph(bodyText, deferredGraph);
  textWithGraph.frontData = frontData;

  return textWithGraph;
}

// Return true if the given graph contains an expression
function containsExpression(obj) {
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "function" && value.code) {
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
