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
  let code = parse(source.text, {
    front,
    grammarSource: source,
    mode,
    startRule,
  });
  const cache = mode === "program" ? {} : null;
  const optimized = optimize(code, {
    cache,
    globals,
    parent,
  });
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
