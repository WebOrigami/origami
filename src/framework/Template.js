import ExplorableObject from "../core/ExplorableObject.js";
import { extractFrontMatter } from "../core/utilities.js";
import DefaultPages from "./DefaultPages.js";
import FormulasTransform from "./FormulasTransform.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import { defineAmbientProperties, setScope } from "./scopeUtilities.js";

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
    const result = new String(text);
    result.toGraph = () => this.createResultGraph(processedInput, context);
    return result;
  }

  async compile() {
    return async (data, graph) => "";
  }

  /**
   * Scope chain: input or input frontData -> template frontData -> ambients -> container
   */
  async createContext(processedInput) {
    const { container, frontData, frontGraph, input, text } = processedInput;

    // Base scope is the container's scope or the container itself.
    const baseScope = container?.scope ?? container;

    // Extend that with ambient properties.
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

    // Extend that with any template front data.
    // TODO: mark scope as isInScope
    let withTemplateFrontGraph;
    if (this.frontGraph) {
      // Avoid directly touching the template's front graph, as it may be reused
      // in future invocations.
      withTemplateFrontGraph = Object.create(this.frontGraph);
      withTemplateFrontGraph.parent = withAmbients;
    } else {
      withTemplateFrontGraph = withAmbients;
    }

    // If the input is a document with front matter, the context object will be
    // the input text, otherwise will be the input itself.
    let contextObject;
    let scope;
    if (frontGraph) {
      contextObject = text;
      // Can modify the input's front graph, as it won't be reused.
      frontGraph.parent = withTemplateFrontGraph;
      scope = frontGraph.scope;
    } else {
      contextObject = input;
      scope = withTemplateFrontGraph.scope;
    }

    // The context is the context object with the constructed scope.
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
  let frontGraph = null;
  let text = String(input);

  if (typeof input === "function") {
    // The input is a function that must be evaluated to get the actual input. A
    // common scenario for this would be an Origami template like foo.ori being
    // called as a block: {{#foo.ori}}...{{/foo.ori}}. The inner contents of the
    // block will be a lambda, i.e., a function that we want to invoke.
    input = await input.call(container);
  }

  if (typeof input === "string" || input instanceof Buffer) {
    const parsed = parseDocument(String(input));
    frontData = parsed.frontData;
    frontGraph = parsed.frontGraph;
    text = parsed.text;
  }

  return {
    container,
    input,
    frontData,
    frontGraph,
    text,
  };
}
