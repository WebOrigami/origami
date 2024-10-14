import { createExpressionFunction } from "../runtime/expressionFunction.js";
import { parse } from "./parse.js";

function compile(source, startRule) {
  if (typeof source === "string") {
    source = { text: source };
  }
  const parseResult = parse(source.text, {
    grammarSource: source,
    startRule,
  });
  const fn = createExpressionFunction(parseResult);
  return fn;
}

export function expression(source) {
  return compile(source, "expression");
}

export function templateDocument(source) {
  return compile(source, "templateDocument");
}
