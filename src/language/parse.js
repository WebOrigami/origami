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
  separatedList,
  sequence,
  series,
} from "./combinators.js";
import { tokenType } from "./lex.js";
import * as ops from "./ops.js";

// Parse arguments to a function, with either explicit or implicit parentheses.
export function args(tokens) {
  return any(parensArgs, implicitParensArgs)(tokens);
}

// Parse a chain of arguments like `(arg1)(arg2)(arg3)`.
export function argsChain(tokens) {
  return series(args)(tokens);
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
    identifier,
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
    object,
    graph,
    array,
    lambda,
    number,
    functionComposition,
    protocolCall,
    slashCall,
    // Groups can start function calls or paths, so need to come after those.
    group,
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

// Parse something that results in a function/graph that can be called.
export function functionCallTarget(tokens) {
  return any(group, protocolCall, slashCall, scopeReference)(tokens);
}

// Parse a function and its arguments, e.g. `fn(arg)`, possibly part of a chain
// of function calls, like `fn(arg1)(arg2)(arg3)`.
export function functionComposition(tokens) {
  const parsed = sequence(functionCallTarget, argsChain)(tokens);
  if (!parsed) {
    return null;
  }
  const { 0: target, 1: chain } = parsed.value;
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
function parensArgs(tokens) {
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

// Top-level parse function parses a expression and returns just the value.
export default function parse(tokens) {
  const parsed = expression(tokens);
  return parsed?.rest === "" ? parsed.value : null;
}

// Parse the start of a path.
export function pathHead(tokens) {
  const parsed = any(group, simpleFunctionCall, scopeReference)(tokens);
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
export function pathKey(tokens) {
  return any(group, substitution, identifier)(tokens);
}

// Parse a protocol call like `fn://foo/bar`.
// There can be zere, one, or two slashes after the colon.
export function protocolCall(tokens) {
  const parsed = sequence(
    identifier,
    matchTokenType(tokenType.COLON),
    optional(matchTokenType(tokenType.SLASH)),
    optional(matchTokenType(tokenType.SLASH)),
    slashPath
  )(tokens);
  if (!parsed) {
    return null;
  }
  const { 0: fnName, 4: fnArgs } = parsed.value;
  const value = [[ops.scope, fnName], ...fnArgs];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a call to look up a value from scope.
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

// Parse a function call that's just `<name>([...args])`.
// This is the only function call form can appear at the head of a path.
export function simpleFunctionCall(tokens) {
  const parsed = sequence(scopeReference, parensArgs)(tokens);
  if (!parsed) {
    return null;
  }
  const value = [parsed.value[0], ...parsed.value[1]]; // function and args
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
