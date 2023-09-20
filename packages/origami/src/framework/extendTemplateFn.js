import { Graph } from "@graphorigami/core";
import merge from "../builtins/@graph/merge.js";

export default function extendTemplateFn(templateFn, template) {
  // TODO: Can this be sync?
  return async function extendedTemplateFn(input) {
    const ambients = {
      "@input": input,
      "@recurse": templateFn,
      "@template": template,
    };
    // TODO: refactor core of merge out of built-in
    const inputGraph = Graph.isGraphable(input) ? Graph.from(input) : null;
    const templateGraph = Graph.isGraphable(template)
      ? Graph.from(template)
      : null;
    const merged = await merge.call(
      null,
      ambients,
      inputGraph,
      templateGraph,
      this
    );
    return templateFn.call(merged, input);
  };
}
