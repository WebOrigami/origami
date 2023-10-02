import { Graph } from "@graphorigami/core";
import * as YAMLModule from "yaml";
import builtins from "../builtins/@builtins.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import ExpressionGraph from "./ExpressionGraph.js";
import TextDocument from "./TextDocument.js";
import { extractFrontMatter } from "./serialize.js";
import { getScope, isPlainObject } from "./utilities.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Representation of a text document with: a) possible front matter distinct
 * from the body text, and b) a `contents` function that interprets the text
 * file as data.
 *
 */
export default class FrontMatterDocument extends TextDocument {
  /**
   * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
   * @typedef {import("@graphorigami/core").PlainObject} PlainObject
   * @typedef {import("../../index.js").StringLike} StringLike
   *
   * @param {StringLike} input
   * @param {{ frontData?: PlainObject, parent?: AsyncDictionary|null }} [options]
   */
  constructor(input, options = {}) {
    let bodyText;
    let frontData;
    if (options.frontData) {
      frontData = options.frontData;
      bodyText = input;
    } else {
      // See if the input has front matter, make graph from it.
      const extracted = extractFrontMatter(input);
      frontData = extracted.frontData;
      bodyText = extracted.bodyText;
    }
    super(bodyText, { parent: options.parent });
    this.frontData = frontData;
  }

  /**
   * @returns {Promise<any>}
   */
  async contents() {
    const frontData = this.frontData;
    if (!frontData) {
      return this.bodyText;
    } else if (containsExpression(frontData)) {
      const graph = new (FileTreeTransform(ExpressionGraph))(frontData);
      graph.parent = this.parent ? getScope(this.parent) : builtins;
      return graph;
    } else {
      return frontData;
    }
  }

  static async fromTextDocument(document) {
    if (document instanceof FrontMatterDocument) {
      return document;
    }
    const contents = await document.contents();
    const frontData = await Graph.plain(contents);
    const parent = document.parent;
    return new FrontMatterDocument(document.bodyText, { frontData, parent });
  }

  toString() {
    if (!this.frontData) {
      return this.bodyText;
    } else {
      const frontText = YAML.stringify(this.frontData).trimEnd();
      return `---\n${frontText}\n---\n${this.bodyText}`;
    }
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
