/**
 * Parse statements in the Origami expression language.
 *
 * See https://graphorigami.org/language/grammar.html for a formal grammar.
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
  series,
  terminal,
} from "./combinators.js";
import { tokenType } from "./lex.js";
import * as ops from "./ops.js";

// Parse arguments to a function, with either explicit or implicit parentheses.
export function args(tokens) {
  return any(parensArgs, implicitParensArgs)(tokens);
}

// Parse a chain of arguments like `(arg1)(arg2)(arg3)`.
export function argsChain(text) {
  return series(args)(text);
}

// Parse an array like `[1, 2, 3]`.
export function array(tokens) {
  const parsed = sequence(
    matchTokenType(tokenType.LEFT_BRACKET),
    list,
    matchTokenType(tokenType.RIGHT_BRACKET)
  )(tokens);
  if (!parsed) {
    return null;
  }
  const value = [ops.array, ...parsed.value[1]];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse an assignment statment.
export function assignment(tokens) {
  const parsed = sequence(
    reference,
    matchTokenType(tokenType.EQUALS),
    expression
  )(tokens);
  if (!parsed) {
    return null;
  }
  let { 0: left, 2: right } = parsed.value;
  const value = [ops.assign, left, right];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse an Origami expression.
export function expression(tokens) {
  // First try parsers for things that have a distinguishing character at the
  // start, e.g., an opening quote, bracket, etc.
  return any(
    string,
    templateLiteral,
    graph,
    object,
    array,
    lambda,
    number,
    // functionComposition,
    // urlProtocolCall,
    // protocolCall,
    slashCall,
    // percentCall,
    // Groups can start function calls or paths, so need to come after those.
    group,
    getReference
  )(tokens);
}

// Parse an assignment formula or shorthand assignment.
export function formulaOrShorthand(text) {
  const parsed = any(assignment, shorthandReference)(text);
  if (!parsed) {
    return null;
  }
  let { value } = parsed;
  if (typeof value === "string") {
    // Shorthand assignment
    value = [ops.assign, value, [ops.inherited, value]];
  }
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse something that results in a function/graph that can be called.
export function functionCallTarget(text) {
  return any(
    group,
    urlProtocolCall,
    protocolCall,
    slashCall,
    percentCall,
    getReference
  )(text);
}

// Parse a function and its arguments, e.g. `fn(arg)`, possibly part of a chain
// of function calls, like `fn(arg1)(arg2)(arg3)`.
export function functionComposition(text) {
  const parsed = sequence(
    optionalWhitespace,
    functionCallTarget,
    argsChain
  )(text);
  if (!parsed) {
    return null;
  }
  const { 1: target, 2: chain } = parsed.value;
  // The argsChain is an array of arguments (which are themselves arrays). The
  // `target` represents the function call target at the head of the chain.
  // Successively apply the arguments in the chain to build up the function
  // composition.
  let value = target;
  for (const args of chain) {
    value = [value, ...args];
  }
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a call to get a value.
export function getReference(tokens) {
  const parsed = reference(tokens);
  if (!parsed) {
    return null;
  }
  const value = [ops.scope, parsed.value];
  return {
    value,
    rest: parsed.rest,
  };
}

export function graph(tokens) {
  const parsed = sequence(
    matchTokenType(tokenType.LEFT_BRACE),
    graphDocument,
    matchTokenType(tokenType.RIGHT_BRACE)
  )(tokens);
  if (!parsed) {
    return null;
  }
  const value = parsed.value[1];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a set of graph formulas.
export function graphDocument(tokens) {
  const parsed = separatedList(
    formulaOrShorthand,
    matchTokenType(tokenType.SEPARATOR)
  )(tokens);
  // Collect formulas, skip separators
  const formulas = {};
  while (parsed.value.length > 0) {
    const formula = parsed.value.shift(); // Next parsed assignment key=value
    if (!formula) {
      // Skip trailing separator
      continue;
    } else {
      // Formula
      const [_, key, value] = formula;
      formulas[key] = value;
    }
    parsed.value.shift(); // Drop separator
  }
  const value = [ops.graph, formulas];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a parenthetical group.
export function group(tokens) {
  const parsed = sequence(
    matchTokenType(tokenType.LEFT_PAREN),
    expression,
    matchTokenType(tokenType.RIGHT_PAREN)
  )(tokens);
  if (!parsed) {
    return null;
  }
  const value = parsed.value[1]; // the expression
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse the arguments to a function where the parentheses have been omitted.
export function implicitParensArgs(tokens) {
  const parsed = list(tokens);
  if (!parsed || parsed?.value.length === 0) {
    // No arguments
    return null;
  }
  return parsed;
}

// A lambda expression
export function lambda(tokens) {
  const parsed = sequence(matchTokenType(tokenType.EQUALS), expression)(tokens);
  if (!parsed) {
    return null;
  }
  const value = [ops.lambda, parsed.value[1]];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a comma-separated list.
export function list(tokens) {
  const parsed = separatedList(
    expression,
    matchTokenType(tokenType.SEPARATOR)
  )(tokens);
  // Remove the parsed separators, which will be in the even positions.
  const value = [];
  while (parsed.value.length > 0) {
    const item = parsed.value.shift();
    // Skip undefined at end of list, which marks a trailing separator.
    if (item !== undefined || parsed.value.length !== 0) {
      value.push(item);
    }
    parsed.value.shift(); // Drop separator
  }
  return {
    value: value,
    rest: parsed.rest,
  };
}

// Parse a left parenthesis.
function lparen(text) {
  return terminal(/^\(/)(text);
}

function matchTokenType(tokenType) {
  return function (tokens) {
    const [head, ...tail] = tokens;
    if (head?.type === tokenType) {
      return {
        value: head.lexeme,
        rest: tail,
      };
    }
    return null;
  };
}

export function number(tokens) {
  const parsed = matchTokenType(tokenType.NUMBER)(tokens);
  if (!parsed) {
    return null;
  }
  const value = Number(parsed.value);
  return {
    value,
    rest: parsed.rest,
  };
}

export function object(tokens) {
  const parsed = sequence(
    matchTokenType(tokenType.LEFT_BRACE),
    objectProperties,
    matchTokenType(tokenType.RIGHT_BRACE)
  )(tokens);
  if (!parsed) {
    return null;
  }
  const value = parsed.value[1];
  return {
    value,
    rest: parsed.rest,
  };
}

export function objectProperties(tokens) {
  const parsed = separatedList(
    objectPropertyOrShorthand,
    matchTokenType(tokenType.SEPARATOR)
  )(tokens);
  if (!parsed) {
    return null;
  }
  // Collect properties, skip separators
  const properties = {};
  while (parsed.value.length > 0) {
    const property = parsed.value.shift(); // Next parsed property key:value
    if (!property) {
      // Skip trailing separator
      continue;
    } else {
      // Object property
      Object.assign(properties, property);
    }
    parsed.value.shift(); // Drop separator
  }
  const value = [ops.object, properties];
  return {
    value,
    rest: parsed.rest,
  };
}

export function objectProperty(tokens) {
  const parsed = sequence(
    reference,
    matchTokenType(tokenType.COLON),
    expression
  )(tokens);
  if (!parsed) {
    return null;
  }
  const value = {
    [parsed.value[0]]: parsed.value[2],
  };
  return {
    value,
    rest: parsed.rest,
  };
}

export function objectPropertyOrShorthand(text) {
  const parsed = any(objectProperty, reference)(text);
  if (!parsed) {
    return null;
  }
  let { value } = parsed;
  if (typeof value === "string") {
    // Shorthand property
    value = {
      [value]: [ops.inherited, value],
    };
  }
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse an optional whitespace sequence.
export function optionalWhitespace(text) {
  return optional(whitespace)(text);
}

// Parse function arguments enclosed in parentheses.
function parensArgs(tokens) {
  const parsed = sequence(
    matchTokenType(tokenType.LEFT_PAREN),
    list,
    matchTokenType(tokenType.RIGHT_PAREN)
  )(tokens);
  if (!parsed) {
    return null;
  }
  // const listValue = parsed.value[1];
  // const value =
  //   listValue === undefined ? undefined : listValue === null ? [] : listValue;
  const value = parsed.value[1];
  return {
    value,
    rest: parsed.rest,
  };
}

// Top-level parse function parses a expression and returns just the value.
export default function parse(text) {
  const parsed = expression(text);
  return parsed?.rest === "" ? parsed.value : null;
}

// Parse the start of a path.
export function pathHead(text) {
  const parsed = any(group, simpleFunctionCall, getReference)(text);
  if (!parsed) {
    return null;
  }
  let value = parsed.value;
  if (value[0] !== ops.scope) {
    value = [value];
  }
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a key in a path.
export function pathKey(text) {
  return any(group, substitution, reference)(text);
}

// Parse a function call with percent syntax.
export function percentCall(text) {
  const parsed = sequence(
    optionalWhitespace,
    pathHead,
    terminal(/^%/),
    optional(percentPath)
  )(text);
  if (!parsed) {
    return null;
  }
  const { 1: value, 3: path } = parsed.value;
  if (path) {
    value.push(...path);
  } else {
    // Trailing separator
    value.push(undefined);
  }
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a percent-delimeted path
export function percentPath(text) {
  const parsed = separatedList(pathKey, terminal(/^%/))(text);
  if (parsed.value.length === 0) {
    // No path keys
    return null;
  }
  // Remove the separators from the result.
  const values = [];
  while (parsed.value.length > 0) {
    values.push(parsed.value.shift()); // Keep value
    parsed.value.shift(); // Drop separator
  }
  return {
    value: values,
    rest: parsed.rest,
  };
}

// Parse a protocol call like `fn://foo/bar`.
// There must be at least one slash after the colon.
export function protocolCall(text) {
  const parsed = sequence(
    optionalWhitespace,
    reference,
    terminal(/^:\/\/?/),
    slashPath
  )(text);
  if (!parsed) {
    return null;
  }
  const { 1: fnName, 3: fnArgs } = parsed.value;
  const value = [[ops.scope, fnName], ...fnArgs];
  return {
    value,
    rest: parsed.rest,
  };
}

export function quotedTextWithEscapes(text) {
  let i;
  let value = "";
  for (i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "'") {
      break;
    } else if (char === "\\") {
      i++;
      if (i < text.length) {
        value += text[i];
      }
    } else {
      value += char;
    }
  }
  const rest = text.slice(i);
  return { value, rest };
}

// Parse a reference
export function reference(tokens) {
  return matchTokenType(tokenType.REFERENCE)(tokens);
}

// Parse a right parenthesis.
function rparen(text) {
  return terminal(/^\)/)(text);
}

export function shorthandReference(text) {
  const parsed = sequence(optionalWhitespace, reference)(text);
  if (!parsed) {
    return null;
  }
  const value = parsed.value[1];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a function call that's just `<name>([...args])`.
// This is the only function call form can appear at the head of a path.
export function simpleFunctionCall(text) {
  const parsed = sequence(optionalWhitespace, getReference, parensArgs)(text);
  if (!parsed) {
    return null;
  }
  const value = [parsed.value[1], ...parsed.value[2]]; // function and args
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a function call with slash syntax.
export function slashCall(tokens) {
  const parsed = sequence(
    optional(matchTokenType(tokenType.SLASH)),
    optional(matchTokenType(tokenType.SLASH)),
    pathHead,
    matchTokenType(tokenType.SLASH),
    optional(slashPath)
  )(tokens);
  if (!parsed) {
    return null;
  }
  let { 2: value, 4: path } = parsed.value;
  if (path) {
    value.push(...path);
  } else {
    // Trailing separator
    value.push(undefined);
  }
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a slash-delimeted path
export function slashPath(tokens) {
  const parsed = separatedList(
    pathKey,
    matchTokenType(tokenType.SLASH)
  )(tokens);
  if (parsed.value.length === 0) {
    // No path keys
    return null;
  }

  // Remove the separators from the result.

  //
  // TODO: separatedList removes separators
  //

  const values = [];
  while (parsed.value.length > 0) {
    values.push(parsed.value.shift()); // Keep value
    parsed.value.shift(); // Drop separator
  }
  return {
    value: values,
    rest: parsed.rest,
  };
}

// Parse a string.
export function string(tokens) {
  return matchTokenType(tokenType.STRING)(tokens);
}

// Parse a substitution like {{foo}} in a template.
export function substitution(tokens) {
  const parsed = sequence(
    matchTokenType(tokenType.DOUBLE_LEFT_BRACE),
    expression,
    matchTokenType(tokenType.DOUBLE_RIGHT_BRACE)
  )(tokens);
  if (!parsed) {
    return null;
  }
  const value = parsed.value[1];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse the text and substitutions in a template.
export function templateDocument(tokens) {
  // We use the separated list parser: the plain text strings are the list
  // items, and the substitutions are the separators.
  const parsed = separatedList(string, substitution)(tokens);

  // Drop empty/null strings.
  const filtered = parsed.value.filter((item) => item);

  // Return a concatenation of the values. If there are no values, return the
  // empty string. If there's just one string, return that directly.
  const value =
    filtered.length === 0
      ? ""
      : filtered.length === 1 && typeof filtered[0] === "string"
      ? filtered[0]
      : [ops.concat, ...filtered];

  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a backtick-quoted template literal.
export function templateLiteral(tokens) {
  const parsed = sequence(
    matchTokenType(tokenType.BACKTICK),
    templateDocument,
    matchTokenType(tokenType.BACKTICK)
  )(tokens);
  if (!parsed) {
    return null;
  }
  const { 1: value } = parsed.value;
  return {
    value,
    rest: parsed.rest,
  };
}

// Trim the whitespace around and in substitution blocks in a template. There's
// no explicit syntax for blocks, but we infer them as any place where a
// substitution itself contains a multi-line template literal.
//
// Example:
//
//     {{ if `
//       true text
//     `, `
//       false text
//     ` }}
//
// Case 1: a substitution that starts the text or starts a line (there's only
// whitespace before the `{{`), and has the line end with the start of a
// template literal (there's only whitespace after the backtick) marks the start
// of a block.
//
// Case 2: a line in the middle that ends one template literal and starts
// another is an internal break in the block. Edge case: three backticks in a
// row, like ```, are common in markdown and are not treated as a break.
//
// Case 3: a line that ends a template literal and ends with `}}` or ends the
// text marks the end of the block.
//
// In all three cases, we trim spaces and tabs from the start and end of the
// line. In case 1, we also remove the preceding newline.
function trimTemplateWhitespace(text) {
  const regex1 = /(^|\n)[ \t]*({{.*?`)[ \t]*\n/g;
  const regex2 = /\n[ \t]*(`(?!`).*?`)[ \t]*\n/g;
  const regex3 = /\n[ \t]*(`(?!`).*?}})[ \t]*(?:\n|$)/g;
  const trimBlockStarts = text.replace(regex1, "$1$2");
  const trimBlockBreaks = trimBlockStarts.replace(regex2, "\n$1");
  const trimBlockEnds = trimBlockBreaks.replace(regex3, "\n$1");
  return trimBlockEnds;
}

// Parse a URL protocol
export function urlProtocol(text) {
  return regex(/^https?/)(text);
}

// Parse a URL protocol call like `https://example.com/foo/bar`.
export function urlProtocolCall(text) {
  const parsed = sequence(
    optionalWhitespace,
    urlProtocol,
    terminal(/^:\/?\/?/),
    slashPath
  )(text);
  if (!parsed) {
    return null;
  }
  const { 1: fnName, 3: fnArgs } = parsed.value;
  const value = [[ops.scope, fnName], ...fnArgs];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a whitespace sequence.
// We consider comments (from a `#` to a newline) to be whitespace.
export function whitespace(text) {
  return terminal(/^(?:\s|(?:#.*(?:\n|$)))+/)(text);
}
