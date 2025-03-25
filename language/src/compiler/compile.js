import { createExpressionFunction } from "../runtime/expressionFunction.js";
import optimize from "./optimize.js";
import { parse } from "./parse.js";

function compile(source, options) {
  const { macros, startRule } = options;
  const enableCaching = options.scopeCaching ?? true;
  if (typeof source === "string") {
    source = { text: source };
  }
  const code = parse(source.text, {
    grammarSource: source,
    startRule,
  });
  const optimized = optimize(code, enableCaching, macros);
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

export function templateBody(source, options = {}) {
  return compile(source, {
    ...options,
    startRule: "templateBody",
  });
}
