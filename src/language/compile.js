import { createExpressionFunction } from "./expressionFunction.js";
import { lex, state } from "./lex.js";
import * as parse from "./parse.js";

function compile(text, compiler, initialLexState = state.EXPRESSION) {
  const tokens = lex(text, initialLexState);
  const parsed = compiler(tokens);
  if (!parsed || parsed.rest.length > 0) {
    throw new SyntaxError(`Invalid expression: ${text}`);
  }
  const code = parsed.value;
  const fn = createExpressionFunction(code);
  return fn;
}

export function expression(text) {
  return compile(text, parse.expression);
}

export function graphDocument(text) {
  return compile(text, parse.graphDocument);
}

export function templateDocument(text) {
  return compile(text, parse.templateDocument, state.TEMPLATE_DOCUMENT);
}
