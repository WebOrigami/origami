import { ObjectGraph } from "@graphorigami/core";
import builtins from "../builtins/@builtins.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import ExpressionGraph from "./ExpressionGraph.js";
import { extractFrontMatter, toYaml } from "./serialize.js";
import { getScope, isPlainObject } from "./utilities.js";

/**
 * Representation of a text file with: a) possible front matter distinct from
 * the body text, and b) a `content` function that interprets the text file as
 * data.
 *
 * This is called a "file" for convenience, but the text could come from
 * anywhere.
 *
 * @typedef {import("@graphorigami/core").HasContents} HasContents
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").StringLike} StringLike
 * @implements {HasContents}
 */
export default class TextFile {
  /**
   * @param {StringLike} input
   * @param {{ bodyText?: StringLike, container?: AsyncDictionary|null, contents?: any}} [options]
   */
  constructor(input, options = {}) {
    this.text = String(input);
    this.bodyText = options.bodyText ? String(options.bodyText) : null;

    if (options.contents) {
      this.contents =
        typeof options.contents === "function"
          ? options.contents
          : () => options.contents;
    } else if (typeof input === "object" && "contents" in input) {
      // Read graph out of input's contents.
      this.contents = input.contents;
    } else {
      // See if the input has front matter, make graph from it.
      const extracted = extractFrontMatter(input);
      this.bodyText = extracted.bodyText;
      const frontData = extracted.frontData;

      if (frontData) {
        let graph;
        this.contents = () => {
          if (!graph) {
            const graphClass = containsExpression(frontData)
              ? ExpressionGraph
              : ObjectGraph;
            graph = new (FileTreeTransform(graphClass))(frontData);
            graph.parent = options.container
              ? getScope(options.container)
              : builtins;
          }
          return graph;
        };
      } else {
        this.contents = () => null;
      }
    }
  }

  static bodyText(obj) {
    return typeof obj === "object" ? obj.bodyText : String(obj);
  }

  static async contents(obj) {
    return typeof obj === "object" ? obj.contents() : null;
  }

  static async frontMatter(obj) {
    if (typeof obj === "object" && obj.contents) {
      const contents = await obj.contents?.();
      if (!contents) {
        return "";
      }
      return (await toYaml(contents)).trimEnd();
    } else {
      return "";
    }
  }

  toString() {
    return this.text;
  }
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
