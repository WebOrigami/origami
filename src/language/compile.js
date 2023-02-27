import { createExpressionFunction } from "./expressionFunction.js";
import { lex } from "./lex.js";
import * as parse from "./parse.js";

export function expression(text) {
  const tokens = lex(text);
  // const parsed = parse.expression(tokens);
  const parsed = parse.number(tokens);
  if (!parsed || parsed.rest.length > 0) {
    throw new SyntaxError(`Invalid expression: ${text}`);
  }
  const code = parsed.value;
  const fn = createExpressionFunction(code);
  return fn;
}
