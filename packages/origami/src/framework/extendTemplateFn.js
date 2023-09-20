import { Graph } from "@graphorigami/core";
import Scope from "../common/Scope.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 */

export default function extendTemplateFn(templateFn, template) {
  // TODO: Can this be sync?
  /** @this {AsyncDictionary|null} */
  return async function extendedTemplateFn(input) {
    const ambients = {
      "@input": input,
      "@recurse": templateFn,
      "@template": template,
    };
    // TODO: refactor core of merge out of built-in
    const inputGraph = Graph.isGraphable(input) ? Graph.from(input) : null;
    const scope = new Scope(ambients, inputGraph, this);
    return templateFn.call(scope, input);
  };
}
