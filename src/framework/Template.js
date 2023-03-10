import * as YAMLModule from "yaml";
import debug from "../builtins/debug.js";
import MergeGraph from "../common/MergeGraph.js";
import StringWithGraph from "../common/StringWithGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ObjectGraph from "../core/ObjectGraph.js";
import { getScope, keySymbol, transformObject } from "../core/utilities.js";
import InheritScopeTransform from "./InheritScopeTransform.js";

// See notes at ExplorableGraph.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

export default class Template {
  constructor(document, scope) {
    this.compiled = null;
    this.templateText = String(document);
    this.templateGraph = document.toGraph?.() ?? null;
    this.templateScope = scope;
  }

  /**
   * Apply the template to the given input data in the context of a graph.
   *
   * @param {any} [input]
   * @param {Explorable} [baseScope]
   */
  async apply(input, baseScope) {
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
   * template. This scope will be
   *
   * input → template front matter → ambient properties → base scope
   */
  async createContext(processedInput, baseScope) {
    // Create the three graphs we'll add to the scope.
    let inputGraph = processedInput.inputGraph
      ? Object.create(processedInput.inputGraph)
      : null;
    if (inputGraph && !("parent" in inputGraph)) {
      inputGraph = transformObject(InheritScopeTransform, inputGraph);
    }

    let templateGraph = this.templateGraph
      ? Object.create(this.templateGraph)
      : null;
    if (templateGraph && !("parent" in templateGraph)) {
      templateGraph = transformObject(InheritScopeTransform, templateGraph);
    }

    // Ambient properties let the template reference specific input/template data.
    const ambients = {
      "@template": {
        graph: templateGraph,
        scope: this.templateScope,
        text: this.templateText,
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
      // @ts-ignore
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
    /** @this {Explorable} */
    return async function (data) {
      return data !== undefined
        ? await templateFunction(data, this)
        : await templateFunction(undefined, this);
    };
  }

  toString() {
    return this.templateText;
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
