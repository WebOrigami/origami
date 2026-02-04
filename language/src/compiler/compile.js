import { createExpressionFunction } from "../runtime/expressionFunction.js";
import optimize from "./optimize.js";
import { parse } from "./parse.js";

/**
 * Compile the given Origami source code into a JavaScript function.
 *
 * @typedef {import("../../index.ts").Source} Source
 * @param {Source|string} source
 * @param {any} options
 */
function compile(source, options) {
  const { front, startRule } = options;
  const globals = options.globals ?? {};
  const mode = options.mode ?? "program";
  const parent = options.parent ?? null;

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
  const fn = createExpressionFunction(optimized, parent);
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
