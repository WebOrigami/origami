import { createExpressionFunction } from "../runtime/expressionFunction.js";
import optimize from "./optimize.js";
import { parse } from "./parse.js";

function compile(source, options) {
  const { front, parent, startRule } = options;
  const mode = options.mode ?? "program";
  const globals = options.globals ?? {};
  if (typeof source === "string") {
    source = { text: source };
  }

  // Parse the code
  let code = parse(source.text, {
    front,
    grammarSource: source,
    mode,
    startRule,
  });

  // Optimize the code
  const cache = mode === "program" ? {} : null;
  const optimized = optimize(code, {
    cache,
    globals,
    parent,
  });

  // Create a function that executes the optimized code.
  const fn = createExpressionFunction(optimized);
  return fn;
}

export function expression(source, options = {}) {
  return compile(source, {
    ...options,
    startRule: "expression",
  });
}

export function program(source, options = {}) {
  return compile(source, {
    ...options,
    startRule: "program",
  });
}

export function templateDocument(source, options = {}) {
  return compile(source, {
    ...options,
    startRule: "templateDocument",
  });
}
