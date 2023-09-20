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
    const merged = await merge.call(null, ambients, input, template);
    return templateFn.call(merged, input);
  };
}
