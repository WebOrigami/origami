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
import * as ops from "./ops.js";

// Parse arguments to a function.
export function args(text) {
  return any(parentheticalArgs, list)(text);
}

// Parse an assignment statment.
export function assignment(text) {
  const result = sequence(
    optionalWhitespace,
    declaration,
    optionalWhitespace,
    terminal(/^=/),
    optionalWhitespace,
    expression,
    optionalWhitespace,
    optional(extension)
  )(text);
  if (!result) {
    return null;
  }
  let { 1: left, 5: right } = result.value;
  right = substituteSelfReferences(right, text);
  // TODO: Clean up
  left = left[0] === ops.get ? left[1] : left;
  const value = ["=", left, right];
  return {
    value,
    rest: result.rest,
  };
}

// Parse a backtick-quoted string.
export function backtickQuoteString(text) {
  const result = sequence(
    optionalWhitespace,
    terminal(/^`/),
    backtickContents,
    terminal(/^`/),
    optionalWhitespace
  )(text);
  if (!result) {
    return null;
  }
  const { 2: contents } = result.value;
  // Drop empty strings.
  const filtered = contents.filter((item) => item !== "");
  const value = [ops.quote, ...filtered];
  return {
    value,
    rest: result.rest,
  };
}

// Parse the text and variable references in a backtick-quoted string
export function backtickContents(text) {
  // It's a bit of a stretch to use the separated list parser for this, but it
  // works. We treat the plain text as the list items, and the variable
  // references as the separators.
  return separatedList(
    optional(backtickText),
    variableReference,
    regex(/^/)
  )(text);
}

// Parse the text in a backtick-quoted string
export function backtickText(text) {
  // Everything but ` and $
  return regex(/^[^\`\$]*/)(text);
}

// Parse a declaration.
export function declaration(text) {
  return any(variableDeclaration, literal)(text);
}

// Parse a double-quoted string.
export function doubleQuoteString(text) {
  const result = sequence(
    optionalWhitespace,
    regex(/^"[^\"]*"/),
    optionalWhitespace
  )(text);
  if (!result) {
    return null;
  }
  const quotedText = result.value[1].slice(1, -1);
  const value = [ops.quote, quotedText];
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
    backtickQuoteString,
    indirectCall,
    group,
    spaceUrl,
    slashCall,
    functionCall,
    variableValue,
    literal
  )(text);
}

// Parse a file extension
export function extension(text) {
  return sequence(terminal(/^./), literal)(text);
}

// Parse a function call.
export function functionCall(text) {
  const result = sequence(
    optionalWhitespace,
    reference,
    args,
    optionalWhitespace
  )(text);
  if (!result) {
    return null;
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
  if (!result) {
    return null;
  }
  const value = result.value[3]; // the expression
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
  if (!result) {
    return null;
  }
  const value = result.value
    ? [result.value[1], ...result.value[3]] // function and args
    : undefined;
  return {
    value,
    rest: result.rest,
  };
}

// A key in an Explorable App
export function key(text) {
  return any(assignment, declaration)(text);
}

// Parse a comma-separated list with at least one term.
export function list(text) {
  const result = separatedList(
    expression,
    terminal(/^,/),
    optionalWhitespace
  )(text);
  if (!result) {
    return null;
  }
  // Remove the separators from the result.
  const value = [];
  while (result.value.length > 0) {
    value.push(result.value.shift()); // Keep value
    result.value.shift(); // Drop separator
  }
  return {
    value: value,
    rest: result.rest,
  };
}

// Parse a literal
export function literal(text) {
  // Identifiers are sequences of everything but terminal characters.
  const result = regex(/^[^=\(\)\{\}\$"'/:`,\s]+/)(text);
  if (!result) {
    return result;
  }
  const value = [ops.get, result.value];
  return {
    value,
    rest: result.rest,
  };
}

// Parse a left parenthesis.
function lparen(text) {
  return terminal(/^\(/)(text);
}

// Parse an optional whitespace sequence.
export function optionalWhitespace(text) {
  return terminal(/^\s*/)(text);
}

// Parse function arguments enclosed in parentheses.
function parentheticalArgs(text) {
  const result = sequence(
    lparen,
    optional(list),
    optionalWhitespace,
    rparen
  )(text);
  if (!result) {
    return null;
  }
  const listValue = result.value[1];
  const value =
    listValue === undefined ? undefined : listValue === null ? [] : listValue;
  return {
    value,
    rest: result.rest,
  };
}

// Top-level parse function parses a expression and returns just the value.
export default function parse(text) {
  const result = expression(text);
  return result.value;
}

// Parse a key in a URL path
export function pathKey(text) {
  const result = any(variableReference, literal)(text);
  if (!result) {
    return null;
  }
  // Quote if it's a literal.
  const value =
    typeof result.value === "string"
      ? [ops.quote, result.value]
      : // TODO: Clean up
      result.value instanceof Array && result.value[0] === ops.get
      ? [ops.quote, result.value[1]]
      : result.value;
  return {
    value,
    rest: result.rest,
  };
}

// Parse a reference.
export function reference(text) {
  return any(variableReference, literal)(text);
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
  if (!result) {
    return null;
  }
  const quotedText = result.value[1].slice(1, -1);
  const value = [ops.quote, quotedText];
  return {
    value,
    rest: result.rest,
  };
}

// Parse a function call with slash syntax.
export function slashCall(text) {
  const result = sequence(
    optionalWhitespace,
    reference,
    terminal(/^\/|:\/\/|:/),
    slashPath,
    optionalWhitespace
  )(text);
  if (!result) {
    return null;
  }
  const { 1: fnName, 3: fnArgs } = result.value;
  let value = [fnName];
  if (fnArgs) {
    value.push(...fnArgs);
  }
  return {
    value,
    rest: result.rest,
  };
}

// Parse a slash-delimeted path
export function slashPath(text) {
  const result = separatedList(pathKey, terminal(/^\//), regex(/^/))(text);
  if (!result) {
    return null;
  }
  // Remove the separators from the result.
  const values = [];
  while (result.value.length > 0) {
    values.push(result.value.shift()); // Keep value
    result.value.shift(); // Drop separator
  }
  return {
    value: values,
    rest: result.rest,
  };
}

// Parse a space-delimeted URL
export function spaceUrl(text) {
  const result = sequence(
    optionalWhitespace,
    spaceUrlProtocol,
    whitespace,
    spaceUrlPath,
    optionalWhitespace
  )(text);
  if (!result) {
    return null;
  }
  const { 1: protocol, 3: path } = result.value;
  const value = [[ops.get, protocol], ...path];
  return {
    value,
    rest: result.rest,
  };
}

// Parse a URL protocol
export function spaceUrlProtocol(text) {
  return regex(/^https?/)(text);
}

// Parse a space-delimeted URL path
export function spaceUrlPath(text) {
  const result = separatedList(pathKey, whitespace, regex(/^/))(text);
  if (!result) {
    return null;
  }
  // Remove the separators from the result.
  const values = [];
  while (result.value.length > 0) {
    values.push(result.value.shift()); // Keep value
    result.value.shift(); // Drop separator
  }
  return {
    value: values,
    rest: result.rest,
  };
}

// Look for occurences of ["ƒ"] in the parsed tree, which represent a call to
// the value of the key defining the assignment. Replace those with the
// indicated text, which will be the entire key.
function substituteSelfReferences(parsed, text) {
  if (!(parsed instanceof Array)) {
    // Return scalar values as is.
    return parsed;
  }
  const substituted = parsed.map((item) =>
    substituteSelfReferences(item, text)
  );
  // TODO: Clean up
  if (
    substituted instanceof Array &&
    substituted[0] === ops.get &&
    typeof substituted[1] === "string" &&
    (substituted[1] === "ƒ" || substituted[1].startsWith("ƒ."))
  ) {
    // Perform substitution.
    if (substituted.length === 2) {
      return [ops.get, text];
    }
    substituted[0] = text;
  }
  return substituted;
}

// Parse a variable name
export function variableName(text) {
  // Like a literal, but periods are not allowed.
  return regex(/^[$A-Za-z_][A-Za-z0-9_$]*/)(text);
}

// Parse a variable declaration like ${x}.json
export function variableDeclaration(text) {
  const result = sequence(
    terminal(/^\{/),
    variableName,
    terminal(/^\}/),
    optional(literal)
  )(text);
  if (!result) {
    return null;
  }
  const { 1: variable, 3: extension } = result.value;
  // TODO: Clean up
  const value = [ops.variable, variable, extension?.[1] ?? null];
  return {
    value,
    rest: result.rest,
  };
}

// Parse a variable reference like $foo.html
export function variableReference(text) {
  const result = sequence(
    terminal(/^\$/),
    variableName,
    optional(literal)
  )(text);
  if (!result) {
    return null;
  }
  const { 1: variable, 2: extension } = result.value;
  // TODO: Clean up
  const value = [ops.variable, variable, extension?.[1] ?? null];
  return {
    value,
    rest: result.rest,
  };
}

// Parse a request to get the value of a variable.
export function variableValue(text) {
  const result = variableReference(text);
  if (!result) {
    return null;
  }
  const value = [ops.get, result.value];
  return {
    value,
    rest: result.rest,
  };
}

// Parse a whitespace sequence.
export function whitespace(text) {
  return terminal(/^\s+/)(text);
}
