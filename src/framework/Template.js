import * as YAMLModule from "yaml";
import merge from "../builtins/merge.js";
import DeferredGraph from "../common/DeferredGraph.js";
import Scope from "../common/Scope.js";
import StringWithGraph from "../common/StringWithGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ObjectGraph from "../core/ObjectGraph.js";
import { extractFrontMatter, transformObject } from "../core/utilities.js";
import DefaultPages from "./DefaultPages.js";
import { isFormulasTransformApplied } from "./FormulasTransform.js";
import MetaTransform from "./MetaTransform.js";
import { getScope } from "./scopeUtilities.js";

// See notes at ExplorableGraph.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

export default class Template {
  constructor(document, scope) {
    this.compiled = null;
    this.scope = scope;
    const { frontData, text } = parseDocument(String(document));
    this.frontData = frontData;
    this.frontGraph = frontData
      ? new (MetaTransform(ObjectGraph))(frontData)
      : null;
    this.text = text;
  }

  /**
   * Apply the template to the given input data in the context of a graph.
   *
   * @param {any} [input]
   * @param {Explorable} [inputScope]
   */
  async apply(input, inputScope) {
    // Compile the template if we haven't already done so.
    if (!this.compiled) {
      this.compiled = await this.compile();
    }

    // Create the execution context for the compiled template.
    const processedInput = await processInput(input, inputScope);
    const { dataGraph, extendedScope } = await this.createContext(
      processedInput,
      inputScope
    );

    const text = await this.compiled(extendedScope);

    // Attach a graph of the resolved template and input data.
    const deferredGraph = new DeferredGraph(() => new DefaultPages(dataGraph));
    const result = new StringWithGraph(text, deferredGraph);
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
  async createContext(processedInput, inputScope) {
    const { input, inputGraph, text } = processedInput;

    // Ambient properties let the template reference specific input/template data.
    const ambients = {
      "@template": {
        frontData: this.frontData,
        scope: this.scope,
        text: this.text,
      },
    };
    if (input) {
      ambients["@input"] = input;
      ambients["."] = inputGraph;
    }
    if (text) {
      ambients["@text"] = text;
    }

    // Construct new scope chain:
    // (input or input frontData + template frontData) -> ambients -> container
    /** @type {Explorable} */
    let scope = new Scope(ambients, getScope(inputScope));

    // Construct the data graph from the input graph and/or template front
    // matter graph, merging if both are present.
    const frontGraph = this.frontGraph;
    let dataGraph;
    let extendedScope = scope;
    if (inputGraph && frontGraph) {
      // Merge the input and template front data.
      // This will set scope on the merged graph.
      dataGraph = await merge.call(scope, inputGraph, frontGraph);
      extendedScope = dataGraph.scope;
    } else if (inputGraph) {
      inputGraph.parent = scope;
      dataGraph = inputGraph;
      extendedScope = inputGraph.scope;
    } else if (frontGraph) {
      dataGraph = frontGraph;
    } else {
      dataGraph = null;
    }

    return { dataGraph, extendedScope };
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
  if (typeof input === "function") {
    // The input is a function that must be evaluated to get the actual input. A
    // common scenario for this would be an Origami template like foo.ori being
    // called as a block: {{foo.ori =`Hello, {{name}}.`}}. The inner contents of
    // the block will be a lambda, i.e., a function that we want to invoke.
    input = await input.call(scope);
  }

  let inputGraph;
  if (ExplorableGraph.canCastToExplorable(input)) {
    inputGraph = ExplorableGraph.from(input);
    if (!isFormulasTransformApplied(inputGraph)) {
      inputGraph = transformObject(MetaTransform, inputGraph);
    }
  } else {
    inputGraph = null;
  }

  let text = input?.toString?.();

  return {
    input,
    inputGraph,
    text,
  };
}
