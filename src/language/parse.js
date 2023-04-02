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
  forcedSequence,
  optional,
  separatedList,
  sequence,
  series,
} from "./combinators.js";
import { tokenType } from "./lex.js";
import * as ops from "./ops.js";

// Parse an absolute file path like `/foo/bar`.
export function absoluteFilePath(tokens) {
  const parsed = leadingSlashPath(tokens);
  if (!parsed) {
    return null;
  }
  const value = [[ops.filesRoot], ...parsed.value];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a chain of arguments like `(arg1)(arg2)(arg3)`.
export function argsChain(tokens) {
  const parsed = series(any(parensArgs, leadingSlashPath))(tokens);
  if (!parsed) {
    return null;
  }
  const value = parsed.value;
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse an array like `[1, 2, 3]`.
export function array(tokens) {
  let parsed;
  try {
    parsed = forcedSequence(
      matchTokenType(tokenType.LEFT_BRACKET),
      list,
      matchTokenType(tokenType.RIGHT_BRACKET)
    )(tokens);
  } catch (error) {
    if (error instanceof SyntaxError && !error.message) {
      throw new SyntaxError(
        'An opening "[" wasn\'t followed by a valid array.'
      );
    } else {
      throw error;
    }
  }
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
    identifier,
    optional(matchTokenType(tokenType.SIGNIFICANT_SPACE)),
    matchTokenType(tokenType.EQUALS),
    expression
  )(tokens);
  if (!parsed) {
    return null;
  }
  let { 0: left, 3: right } = parsed.value;
  const value = [ops.assign, left, right];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse something that results in a function/graph that can be called. This is
// more restrictive than the `expression` parser -- it doesn't accept function
// calls -- to avoid infinite recursion.
export function callTarget(tokens) {
  return any(
    absoluteFilePath,
    array,
    object,
    graph,
    lambda,
    protocolCall,
    group,
    scopeReference
  )(tokens);
}

// Parse an Origami expression.
export function expression(tokens) {
  return any(
    // First try parsers that directly match a single token.
    string,
    number,
    // Function calls come next, as they can start with the expression types
    // that follow (array, object, etc.); we want to parse the largest thing
    // possible first.
    implicitParensCall,
    functionComposition,
    // Then try parsers that look for a distinctive token at the start: an
    // opening slash, bracket, curly brace, etc.
    absoluteFilePath,
    array,
    object,
    graph,
    lambda,
    templateLiteral,
    group,
    // Protocol calls are distinguished by a colon, but the colon doesn't appear
    // at the start.
    protocolCall,
    // Last option is a simple scope reference.
    scopeReference
  )(tokens);
}

// Parse an assignment formula or shorthand assignment.
export function formulaOrShorthand(tokens) {
  const parsed = any(assignment, identifier)(tokens);
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

// Parse a function and its arguments, e.g. `fn(arg)`, possibly part of a chain
// of function calls, like `fn(arg1)(arg2)(arg3)`.
export function functionComposition(tokens) {
  const parsed = sequence(callTarget, argsChain)(tokens);
  if (!parsed) {
    return null;
  }
  const { 0: target, 1: chain } = parsed.value;
  let value = target;
  // The argsChain is an array of arguments (which are themselves arrays). We
  // successively apply the top-level elements of that chain to build up the
  // function composition.
  for (const args of chain) {
    value = [value, ...args];
  }
  return {
    value,
    rest: parsed.rest,
  };
}

export function graph(tokens) {
  // Expressions try to parse graphs after objects, so if we see a left brace
  // here, but the rest doesn't parse, it's a syntax error.
  let parsed;
  try {
    parsed = forcedSequence(
      matchTokenType(tokenType.LEFT_BRACE),
      graphDocument,
      matchTokenType(tokenType.RIGHT_BRACE)
    )(tokens);
  } catch (error) {
    if (error instanceof SyntaxError && !error.message) {
      throw new SyntaxError(
        'An opening "{" brace was not followed by a valid object or graph definition.'
      );
    } else {
      throw error;
    }
  }
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
  // Collect formulas
  const formulas = {};
  for (const assignment of parsed.value) {
    // Skip any undefined assignment, which would be a trailing separator
    if (assignment) {
      const [_, key, value] = assignment;
      formulas[key] = value;
    }
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

// Parse an identifier
export function identifier(tokens) {
  return matchTokenType(tokenType.REFERENCE)(tokens);
}

// Parse an identifier that may include a colon and port number, like
// `example.com:80`. This is used as a special case at the head of a path, where
// we want to interpret a colon as part of a text identifier instead of as a
// colon token.
export function identifierWithPort(tokens) {
  const parsed = sequence(
    identifier,
    optional(sequence(matchTokenType(tokenType.COLON), number))
  )(tokens);
  if (!parsed) {
    return null;
  }
  let value = parsed.value[0];
  if (parsed.value[1]) {
    // Append port number
    value += `:${parsed.value[1][1]}`;
  }
  return {
    value,
    rest: parsed.rest,
  };
}

export function implicitParensCallTarget(tokens) {
  return any(functionComposition, callTarget)(tokens);
}

// Parse a function call with implicit parentheses, like: `fn 1, 2, 3`.
export function implicitParensCall(tokens) {
  const parsed = sequence(
    implicitParensCallTarget,
    matchTokenType(tokenType.SIGNIFICANT_SPACE),
    list
  )(tokens);
  if (!parsed) {
    return null;
  }
  const { 0: fn, 2: fnArgs } = parsed.value;
  if (fnArgs.length === 0) {
    // No arguments
    return null;
  }
  const value = [fn, ...fnArgs];
  return {
    value,
    rest: parsed.rest,
  };
}

// A lambda expression
export function lambda(tokens) {
  let parsed;
  try {
    parsed = forcedSequence(
      matchTokenType(tokenType.EQUALS),
      expression
    )(tokens);
  } catch (error) {
    if (error instanceof SyntaxError && !error.message) {
      throw new SyntaxError(
        'An equals sign "=" was not followed by a valid expression.'
      );
    } else {
      throw error;
    }
  }
  if (!parsed) {
    return null;
  }
  const value = [ops.lambda, parsed.value[1]];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a path that begins with a slash, like `/foo/bar`.
export function leadingSlashPath(tokens) {
  const parsed = sequence(
    matchTokenType(tokenType.SLASH),
    optional(slashPath)
  )(tokens);
  if (!parsed) {
    return null;
  }
  let { 1: value } = parsed.value;
  if (!value) {
    // Input is just a slash with no following path: /
    value = [undefined];
  }
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
  const value = parsed.value;
  // If the last item is undefined, it's a trailing separator, so drop it.
  if (value.length > 1 && value[value.length - 1] === undefined) {
    value.pop();
  }
  return {
    value,
    rest: parsed.rest,
  };
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
  // Collect properties
  const properties = {};
  for (const property of parsed.value) {
    Object.assign(properties, property);
  }
  const value = [ops.object, properties];
  return {
    value,
    rest: parsed.rest,
  };
}

export function objectProperty(tokens) {
  const parsed = sequence(
    identifier,
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

export function objectPropertyOrShorthand(tokens) {
  const parsed = any(objectProperty, identifier)(tokens);
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

// Parse function arguments enclosed in parentheses.
export function parensArgs(tokens) {
  const parsed = sequence(
    matchTokenType(tokenType.LEFT_PAREN),
    list,
    matchTokenType(tokenType.RIGHT_PAREN)
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

// Parse a key in a path.
export function pathKey(tokens) {
  const parsed = any(
    // We treat number in paths as strings, so don't use the number() parser.
    matchTokenType(tokenType.NUMBER),
    identifier
  )(tokens);
  if (!parsed) {
    return null;
  }
  let value = parsed.value;
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a protocol call like `fn://foo/bar`.
// There can be zero, one, or two slashes after the colon.
export function protocolCall(tokens) {
  const parsed = sequence(
    scopeReference,
    matchTokenType(tokenType.COLON),
    optional(matchTokenType(tokenType.SLASH)),
    optional(matchTokenType(tokenType.SLASH)),
    identifierWithPort,
    optional(matchTokenType(tokenType.SLASH)),
    optional(slashPath)
  )(tokens);
  if (!parsed) {
    return null;
  }
  let { 0: fn, 4: pathHead, 6: path } = parsed.value;
  // Certain protocols like http: and https: are special-cased to always
  // reference built-in functions.
  const builtInProtocols = {
    http: ops.http,
    https: ops.https,
    graph: ops.graphHttps, // Shorthand for graphHttps:
    graphhttp: ops.graphHttp,
    graphhttps: ops.graphHttps,
  };
  // Prefer built-in protocol, otherwise treat the protocol as a normal function.
  if (fn[0] === ops.scope) {
    const protocol = fn[1]?.toLowerCase();
    if (builtInProtocols[protocol]) {
      fn = builtInProtocols[protocol];
    }
  }
  const value = [fn, pathHead];
  if (path) {
    value.push(...path);
  }
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a call to look up an identifier in scope.
export function scopeReference(tokens) {
  const parsed = identifier(tokens);
  if (!parsed) {
    return null;
  }
  const value = [ops.scope, parsed.value];
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
  if (!parsed) {
    return null;
  }
  if (parsed.value.length === 0) {
    // No keys
    return null;
  }
  return parsed;
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
  const parsed = separatedList(string, substitution, true)(tokens);

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
  // The lexer generates an error for an unterminated template literal, so we
  // don't need to check for that here.
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
