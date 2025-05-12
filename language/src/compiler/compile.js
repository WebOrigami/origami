import { createExpressionFunction } from "../runtime/expressionFunction.js";
import jsGlobals from "../runtime/jsGlobals.js";
import optimize from "./optimize.js";
import { parse } from "./parse.js";

function compile(source, options) {
  const { macros, parent, startRule } = options;
  const mode = options.mode ?? "shell";
  const globals = options.globals ?? jsGlobals;
  const enableCaching = options.scopeCaching ?? true;
  if (typeof source === "string") {
    source = { text: source };
  }
  const code = parse(source.text, {
    grammarSource: source,
    mode,
    startRule,
  });
  const optimized = optimize(code, {
    enableCaching,
    globals,
    macros,
    mode,
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
