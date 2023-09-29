import { Graph, ObjectGraph } from "@graphorigami/core";
import { getScope, isPlainObject } from "../common/utilities.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import ExpressionGraph from "./ExpressionGraph.js";
import TextWithContents from "./TextWithContents.js";
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
 * @type {import("../../index.js").FileLoaderFunction}
 */
export default function loadTextWithFrontMatter(container, input, key) {
  const scope = getScope(container);
  let contents;
  return new TextWithContents(input, () => {
    if (contents === undefined) {
      let { bodyText, frontData } = extractFrontMatter(input);
      if (!frontData) {
        frontData = {};
      }

      // Return plain text as default value of contents graph.
      // @ts-ignore
      frontData[Graph.defaultValueKey] = bodyText;

      const graphClass = containsExpression(frontData)
        ? ExpressionGraph
        : ObjectGraph;
      contents = new (FileTreeTransform(graphClass))(frontData);
      if (scope) {
        contents.parent = scope;
      }
    }
    return contents;
  });
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
