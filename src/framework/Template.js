import * as YAMLModule from "yaml";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ExplorableObject from "../core/ExplorableObject.js";
import { extractFrontMatter, isPlainObject } from "../core/utilities.js";
import DefaultPages from "./DefaultPages.js";
import FormulasTransform from "./FormulasTransform.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import { defineAmbientProperties, setScope } from "./scopeUtilities.js";
import StringWithGraph from "./StringWithGraph.js";

// See notes at ExplorableGraph.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

export default class Template {
  constructor(document, container) {
    this.compiled = null;
    this.container = container;
    const { frontData, frontGraph, text } = parseDocument(String(document));
    this.frontData = frontData;
    this.frontGraph = frontGraph;
    this.text = text;
  }

  /**
   * Apply the template to the given input data in the context of a graph.
   *
   * @param {any} [input]
   * @param {Explorable} [container]
   */
  async apply(input, container) {
    // Compile the template if we haven't already done so.
    if (!this.compiled) {
      this.compiled = await this.compile();
    }

    // Create the execution context for the compiled template.
    const processedInput = await processInput(input, container);
    const context = await this.createContext(processedInput);

    const text = await this.compiled(context);

    // Attach a lazy graph of the resolved template and input data.
    const result = new StringWithGraph(text, null);
    result.toGraph = () => this.createResultGraph(processedInput, context);
    return result;
  }

  async compile() {
    return async (context) => "";
  }

  /**
   * Scope chain: input or input frontData -> template frontData -> ambients -> container
   */
  async createContext(processedInput) {
    const { container, frontData, inputGraph, input, text } = processedInput;

    // By default, the context object will be the input itself.
    let contextObject = input;

    // Base scope is the container's scope or the container itself.
    const baseScope = container?.scope ?? container;

    // Extend the scope with ambient properties.
    const withAmbients = defineAmbientProperties(baseScope, {
      "@container": container,
      "@frontData": frontData,
      "@input": input,
      "@template": {
        container: this.container,
        frontData: this.frontData,
        text: this.text,
      },
      "@text": text,
    });

    // Extend the scope with any template front data.
    let withTemplateFrontGraph;
    if (this.frontGraph) {
      // Avoid directly touching the template's front graph, as it may be reused
      // in future invocations.
      withTemplateFrontGraph = Object.create(this.frontGraph);
      withTemplateFrontGraph.parent = withAmbients;
    } else {
      withTemplateFrontGraph = withAmbients;
    }

    // Extend the scope with any explorable input data.
    let withInputGraph;
    if (inputGraph) {
      // We either have front matter, or the input itself is explorable data.
      if (frontData) {
        // In the case where we have front matter, the context object is the
        // input text.
        contextObject = text;
      }
      // Can modify the input's front graph, as it won't be reused.
      inputGraph.parent = withTemplateFrontGraph;
      withInputGraph = inputGraph;
    } else {
      withInputGraph = withTemplateFrontGraph;
    }
    const scope = withInputGraph.scope;

    // The complete context is the context object with the constructed scope
    // attached to it.
    const context = setScope(contextObject, scope);

    return context;
  }

  createResultGraph(processedInput, context) {
    const data = Object.assign(
      {},
      this.frontData,
      processedInput.frontData ?? processedInput.input
    );
    const dataGraph = new (InheritScopeTransform(
      FormulasTransform(ExplorableObject)
    ))(data);
    dataGraph.parent = context;
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
  const frontGraph = frontData
    ? new (InheritScopeTransform(FormulasTransform(ExplorableObject)))(
        frontData
      )
    : null;
  const text = frontMatter?.bodyText ?? document;
  return { frontData, frontGraph, text };
}

// If the input is a string, parse it as a document that may have front matter.
async function processInput(input, container) {
  let frontData = null;
  let inputGraph = null;

  if (typeof input === "function") {
    // The input is a function that must be evaluated to get the actual input. A
    // common scenario for this would be an Origami template like foo.ori being
    // called as a block: {{#foo.ori}}...{{/foo.ori}}. The inner contents of the
    // block will be a lambda, i.e., a function that we want to invoke.
    input = await input.call(container);
  }

  let text =
    typeof input === "string" || input instanceof Buffer ? String(input) : null;

  let inputData = input;
  if (typeof input === "string" || input instanceof Buffer) {
    // Try parsing input as a document with front matter.
    const inputText = String(input);
    const parsedDocument = parseDocument(inputText);
    if (parsedDocument.frontData) {
      frontData = parsedDocument.frontData;
      inputGraph = parsedDocument.frontGraph;
      text = parsedDocument.text;
    } else {
      // Input has no front matter, but input itself may be YAML/JSON.
      try {
        inputData = YAML.parse(inputText);
      } catch (e) {
        // Input is not YAML/JSON.
      }
    }
  }

  if (ExplorableGraph.isExplorable(input)) {
    inputGraph = input;
  } else if (isPlainObject(inputData)) {
    // Construct input graph from the input data.
    inputGraph = new (InheritScopeTransform(
      FormulasTransform(ExplorableObject)
    ))(inputData);
  }

  return {
    container,
    frontData,
    input,
    inputGraph,
    text,
  };
}
