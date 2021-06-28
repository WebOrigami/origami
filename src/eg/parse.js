/**
 * Parse statements in the eg language.
 *
 * See ReadMe.md for a high-level descripton of the grammar.
 *
 * This is a basic parser combinator-based parser: each term in the grammar is
 * handled by a function that can recognize that type of term at the start of a
 * text string.
 *
 * The result of a parser function is a `{ value, rest }` tuple, in which
 * `value` is the result of the parse operation. `value` will be `undefined` if
 * the parser could not recognize the text. The `rest` value is the remaining
 * text after the parse operation.
 *
 * Higher-order combinators handle things like sequences of terms or choices
 * between possible terms.
 */

import {
  any,
  optional,
  regex,
  separatedList,
  sequence,
  terminal,
} from "./combinators.js";

// Parse arguments to a function.
export function args(text) {
  return any(parentheticalArgs, list)(text);
}

// Parse an assignment statment.
export function assignment(text) {
  const result = sequence(
    optionalWhitespace,
    reference,
    optionalWhitespace,
    terminal(/=/),
    optionalWhitespace,
    expression
  )(text);
  if (!result.value) {
    return result;
  }
  let { 1: left, 5: right } = result.value;
  // Handle special case where right side is just a file extension.
  const isExtension =
    right.length === 1 &&
    typeof right[0] === "string" &&
    /^\.\S+$/.test(right[0]);
  if (isExtension) {
    // Use entire text as a file name.
    right = text;
  }
  const value = ["=", left, right];
  return {
    value,
    rest: result.rest,
  };
}

// Parse a double-quoted string.
export function doubleQuoteString(text) {
  const result = sequence(
    optionalWhitespace,
    regex(/^"[^\"]*"/),
    optionalWhitespace
  )(text);
  if (!result.value) {
    return result;
  }
  const quotedText = result.value[1].slice(1, -1);
  const value = ["quote", quotedText];
  return {
    value,
    rest: result.rest,
  };
}

// Parse an eg expression.
export function expression(text) {
  return any(
    doubleQuoteString,
    singleQuoteString,
    indirectCall,
    group,
    functionCall
  )(text);
}

// Parse a function call.
export function functionCall(text) {
  const result = sequence(
    optionalWhitespace,
    reference,
    optional(args),
    optionalWhitespace
  )(text);
  if (result.value === undefined) {
    return result;
  }
  const { 1: fnName, 2: fnArgs } = result.value;
  let value = [fnName];
  if (fnArgs) {
    value.push(...fnArgs);
  }
  return {
    value,
    rest: result.rest,
  };
}

// Parse a parenthetical group.
export function group(text) {
  const result = sequence(
    optionalWhitespace,
    lparen,
    optionalWhitespace,
    expression,
    optionalWhitespace,
    rparen,
    optionalWhitespace
  )(text);
  const value = result.value?.[3]; // the expression
  return {
    value,
    rest: result.rest,
  };
}

// Parse an indirect function call like `(fn)(arg1, arg2)`.
export function indirectCall(text) {
  const result = sequence(
    optionalWhitespace,
    group,
    optionalWhitespace,
    args,
    optionalWhitespace
  )(text);
  const value = result.value
    ? [result.value[1], ...result.value[3]] // function and args
    : undefined;
  return {
    value,
    rest: result.rest,
  };
}

// Parse a comma-separated list with at least one term.
export function list(text) {
  return separatedList(expression, regex(/,/), optionalWhitespace)(text);
}

// Parse a left parenthesis.
function lparen(text) {
  return terminal(/^\(/)(text);
}

// Parse function arguments enclosed in parentheses.
function parentheticalArgs(text) {
  const result = sequence(
    optionalWhitespace,
    lparen,
    optionalWhitespace,
    optional(list),
    optionalWhitespace,
    rparen,
    optionalWhitespace
  )(text);
  const listValue = result.value?.[3];
  const value =
    listValue === undefined ? undefined : listValue === null ? [] : listValue;
  return {
    value,
    rest: result.rest,
  };
}

// Top-level parse function parses a statement and returns just the value.
export default function parse(text) {
  const result = statement(text);
  return result.value;
}

// Parse a reference to a function, graph, etc.
export function reference(text) {
  // References are sequences of everything but terminal characters.
  return regex(/^[^=\(\)"',\s]+/)(text);
}

// Parse a right parenthesis.
function rparen(text) {
  return terminal(/^\)/)(text);
}

// Parse a single-quoted string.
export function singleQuoteString(text) {
  const result = sequence(
    optionalWhitespace,
    regex(/^'[^\']*'/),
    optionalWhitespace
  )(text);
  if (!result.value) {
    return result;
  }
  const quotedText = result.value[1].slice(1, -1);
  const value = ["quote", quotedText];
  return {
    value,
    rest: result.rest,
  };
}

// Parse an eg statement.
export function statement(text) {
  return any(assignment, expression)(text);
}

// Parse an optional whitespace sequence.
export function optionalWhitespace(text) {
  return terminal(/^\s*/)(text);
}
