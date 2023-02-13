import * as YAMLModule from "yaml";
import setScope from "../builtins/setScope.js";
import DeferredGraph from "../common/DeferredGraph.js";
import Scope from "../common/Scope.js";
import StringWithGraph from "../common/StringWithGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import DefaultPages from "./DefaultPages.js";

// See notes at ExplorableGraph.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

export default class Template {
  constructor(document, scope) {
    this.compiled = null;
    this.templateText = String(document);
    this.templateGraph = document.toGraph?.() ?? null;
    this.scope = scope;
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
    const { extendedScope, inputGraph, templateGraph } =
      await this.createContext(processedInput, inputScope);

    const text = await this.compiled(extendedScope);

    // Attach a graph of the resolved template and input data.
    const deferredGraph = new DeferredGraph(
      () =>
        new DefaultPages({
          "@input": inputGraph,
          "@template": templateGraph,
        })
    );
    const result = new StringWithGraph(text, deferredGraph);
    return result;
  }

  async compile() {
    return async (scope) => "";
  }

  /**
   * Create a scope that will be the context for executing the compiled
   * template. This scope will include the input, the template front matter (if
   * present), some ambient properties, and the input's scope.
   */
  async createContext(processedInput, inputScope) {
    // Ambient properties let the template reference specific input/template data.
    const ambients = {
      "@template": {
        graph: this.templateGraph,
        scope: this.scope,
        text: this.templateText,
      },
      "@input": processedInput.input,
      ".": processedInput.inputGraph,
      "@text": processedInput.text,
    };

    const baseScope = new Scope(ambients, inputScope);
    const templateGraph = this.templateGraph
      ? setScope(this.templateGraph, baseScope)
      : null;
    const inputParent = templateGraph?.scope ?? baseScope;
    const inputGraph = processedInput.inputGraph
      ? setScope(processedInput.inputGraph, inputParent)
      : null;
    const extendedScope = inputGraph?.scope ?? inputParent;

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

async function processInput(input, scope) {
  if (typeof input === "function") {
    // The input is a function that must be evaluated to get the actual input. A
    // common scenario for this would be an Origami template like foo.ori being
    // called as a block: {{foo.ori =`Hello, {{name}}.`}}. The inner contents of
    // the block will be a lambda, i.e., a function that we want to invoke.
    input = await input.call(scope);
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
