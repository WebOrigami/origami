import { ObjectGraph } from "@graphorigami/core";
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
 * graph with the front matter and document content as data.
 *
 * If the input is not a string or Buffer, it is returned as is.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").StringLike} StringLike
 *
 * @param {StringLike} input
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadTextWithFrontMatter(input, key) {
  if (!stringLike(input)) {
    return input;
  }

  /** @type {any} */
  let textFile;

  const inputContents =
    typeof input === "object" ? /** @type {any} */ (input).contents?.() : null;

  const { bodyText, frontData } = extractFrontMatter(input);
  if (frontData) {
    const scope = this;
    textFile = new String(input);
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
    textFile.frontData = frontData;
    textFile.bodyText = bodyText;

    // TODO: Remove once we're no longer using toGraph.
    textFile.toGraph = () => {
      const contents = textFile.contents();
      return contents instanceof Promise
        ? new DeferredGraph(contents)
        : contents;
    };
  } else if (inputContents) {
    // Input has graph; attach that to the text.
    textFile = new String(input);
    textFile.contents = () => inputContents;
    textFile.bodyText = textFile;
  } else {
    textFile = String(input);
  }

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
