import * as YAMLModule from "yaml";
import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ObjectGraph from "../core/ObjectGraph.js";
import { extractFrontMatter, stringLike } from "../core/utilities.js";
import DefaultPages from "./DefaultPages.js";
import FormulasTransform from "./FormulasTransform.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import { getScope } from "./scopeUtilities.js";
import StringWithGraph from "./StringWithGraph.js";

// See notes at ExplorableGraph.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

export default class Template {
  constructor(document, scope) {
    this.compiled = null;
    this.scope = scope;
    const { frontData, text } = parseDocument(String(document));
    this.frontData = frontData;
    this.text = text;
  }

  /**
   * Apply the template to the given input data in the context of a graph.
   *
   * @param {any} [input]
   * @param {Explorable} [scope]
   */
  async apply(input, scope) {
    // Compile the template if we haven't already done so.
    if (!this.compiled) {
      this.compiled = await this.compile();
    }

    // Create the execution context for the compiled template.
    const processedInput = await processInput(input, scope);
    const { dataGraph, scope: extendedScope } = await this.createContext(
      processedInput
    );

    const text = await this.compiled(extendedScope);

    // Attach a graph of the resolved template and input data.
    const result = new StringWithGraph(text, null);
    result.toGraph = () => this.createResultGraph(dataGraph);
    return result;
  }

  async compile() {
    return async (scope) => "";
  }

  /**
   * Create an object that will be the context for executing the compiled
   * template. This will be some form of the input, along with a scope that
   * includes input data, template data, ambient properties, and the input's
   * container.
   */
  async createContext(processedInput) {
    const {
      frontData,
      input,
      inputData,
      scope: inputScope,
      text,
    } = processedInput;

    // Ambient properties let the template reference specific input/template data.
    const ambients = {
      "@frontData": frontData,
      "@template": {
        frontData: this.frontData,
        scope: this.scope,
        text: this.text,
      },
      "@text": text,
      ".": input ?? null,
    };

    // Construct new scope chain:
    // (input or input frontData + template frontData) -> ambients -> container
    /** @type {Explorable} */
    let scope = new Scope(ambients, getScope(inputScope));

    // Construct the graph for the data that the template will be applied to.
    // This graph combines the input data (if present) with the template data
    // (if present).
    const data =
      inputData || this.frontData
        ? Object.assign({}, this.frontData, inputData)
        : null;
    const dataGraph = data
      ? new (InheritScopeTransform(FormulasTransform(ObjectGraph)))(data)
      : null;
    if (dataGraph) {
      dataGraph.parent = scope;
      scope = dataGraph.scope;
    }

    return { dataGraph, scope };
  }

  createResultGraph(dataGraph) {
    const withPages = new DefaultPages(dataGraph);
    return withPages;
  }

  toFunction() {
    const templateFunction = this.apply.bind(this);
    /** @this {Explorable} */
    return async function (data) {
      return data !== undefined
        ? await templateFunction(data, this)
        : await templateFunction(undefined, this);
    };
  }

  toString() {
    return this.text;
  }
}

// Extract the body text and any front matter from a template document.
function parseDocument(document) {
  const frontMatter = extractFrontMatter(document);
  const frontData = frontMatter?.frontData;
  const text = frontMatter?.bodyText ?? document;
  return { frontData, text };
}

// If the input is a string, parse it as a document that may have front matter.
async function processInput(input, scope) {
  let frontData;

  if (typeof input === "function") {
    // The input is a function that must be evaluated to get the actual input. A
    // common scenario for this would be an Origami template like foo.ori being
    // called as a block: {{#foo.ori}}...{{/foo.ori}}. The inner contents of the
    // block will be a lambda, i.e., a function that we want to invoke.
    input = await input.call(scope);
  }

  let text = stringLike(input) ? String(input) : null;

  let inputData = input;
  if (stringLike(input)) {
    // Try parsing input as a document with front matter.
    const inputText = String(input);
    const parsedDocument = parseDocument(inputText);
    if (parsedDocument.frontData) {
      frontData = parsedDocument.frontData;
      inputData = frontData;
      text = parsedDocument.text;
    } else {
      // Input has no front matter, but input itself may be YAML/JSON.
      try {
        inputData = YAML.parse(inputText);
      } catch (e) {
        // Input is not YAML/JSON.
      }
    }
  } else if (ExplorableGraph.isExplorable(input)) {
    inputData = await ExplorableGraph.plain(input);
  }

  return {
    frontData,
    input,
    inputData,
    scope,
    text,
  };
}
