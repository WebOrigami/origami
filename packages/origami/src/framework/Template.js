import { ObjectGraph } from "@graphorigami/core";
import * as YAMLModule from "yaml";
import builtins from "../builtins/@builtins.js";
import debug from "../builtins/@debug.js";
import MergeGraph from "../common/MergeGraph.js";
import StringWithGraph from "../common/StringWithGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import {
  extractFrontMatter,
  getScope,
  graphInContext,
  keySymbol,
} from "../core/utilities.js";
import InheritScopeTransform from "./InheritScopeTransform.js";

// See notes at ExplorableGraph.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

export default class Template {
  constructor(document, scope) {
    this.compiled = null;
    const text = String(document);
    this.bodyText = document.bodyText ?? text;
    if (document.toGraph) {
      this.graph = document.toGraph();
    } else {
      const { frontData } = extractFrontMatter(text);
      this.graph = frontData;
    }
    this.scope = scope;
    this.text = text;
  }

  /**
   * Apply the template to the given input data in the context of a graph.
   *
   * @param {any} [input]
   * @param {Explorable|null} [baseScope]
   */
  async apply(input, baseScope = builtins) {
    // Compile the template if we haven't already done so.
    if (!this.compiled) {
      this.compiled = await this.compile();
    }

    // Create the execution context for the compiled template.
    const processedInput = await processInput(input, baseScope);
    const { extendedScope, inputGraph, templateGraph } =
      await this.createContext(processedInput, baseScope);

    const text = await this.compiled.call(extendedScope);

    const result = await createResult(text, inputGraph, templateGraph);
    return result;
  }

  async compile() {
    return async (scope) => "";
  }

  /**
   * Create a scope that will be the context for executing the compiled
   * template. This scope will be:
   *
   * input → template front matter → ambient properties → base scope
   */
  async createContext(processedInput, baseScope) {
    // Create the three graphs we'll add to the scope.
    const inputGraph = processedInput.inputGraph
      ? graphInContext(processedInput.inputGraph, baseScope)
      : null;
    const templateGraph = this.graph
      ? graphInContext(this.graph, baseScope)
      : null;

    // Ambient properties let the template reference specific input/template data.
    const ambients = {
      "@template": {
        graph: templateGraph,
        recurse: this.toFunction(),
        scope: this.scope,
        text: this.bodyText,
      },
      "@input": processedInput.input,
      "@text": processedInput.text,
    };
    if (inputGraph) {
      ambients["."] = inputGraph;
    }
    const ambientsGraph = new (InheritScopeTransform(ObjectGraph))(ambients);
    ambientsGraph[keySymbol] = this[keySymbol];

    // Set all the scopes
    ambientsGraph.parent = baseScope;
    if (templateGraph) {
      templateGraph.parent = ambientsGraph;
    }
    if (inputGraph) {
      inputGraph.parent = templateGraph ?? ambientsGraph;
    }

    const extendedScope =
      // @ts-ignore
      inputGraph?.scope ?? templateGraph?.scope ?? ambientsGraph.scope;

    return { inputGraph, templateGraph, extendedScope };
  }

  toFunction() {
    const templateFunction = this.apply.bind(this);
    const templateScope = this.scope;
    /** @this {Explorable|null} */
    return async function (data) {
      const scope = this ?? templateScope;
      return data !== undefined
        ? await templateFunction(data, scope)
        : await templateFunction(undefined, scope);
    };
  }

  toString() {
    return this.text;
  }
}

async function createResult(text, inputGraph, templateGraph) {
  if (!inputGraph && !templateGraph) {
    return text;
  }

  let dataGraph;
  if (inputGraph && !templateGraph) {
    dataGraph = inputGraph;
  } else if (!inputGraph && templateGraph) {
    dataGraph = templateGraph;
  } else {
    // Merge the template graph as "@template" into the input graph.
    dataGraph = new MergeGraph(inputGraph, {
      "@template": templateGraph,
    });
  }

  const scope = getScope(dataGraph);
  const attachedGraph = await debug.call(scope, dataGraph);

  const result = new StringWithGraph(text, attachedGraph);
  return result;
}

async function processInput(input, baseScope) {
  if (typeof input === "function") {
    // The input is a function that must be evaluated to get the actual input. A
    // common scenario for this would be an Origami template like foo.ori being
    // called as a block: {{foo.ori =`Hello, {{name}}.`}}. The inner contents of
    // the block will be a lambda, i.e., a function that we want to invoke.
    input = await input.call(baseScope);
  }

  let inputGraph = ExplorableGraph.canCastToExplorable(input)
    ? ExplorableGraph.from(input)
    : null;

  let text = input?.toString?.();

  return {
    input,
    inputGraph,
    text,
  };
}
