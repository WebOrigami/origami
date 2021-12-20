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
  return any(parentheticalArgs, omittedParensArgs)(text);
}

// Parse an assignment statment.
export function assignment(text) {
  const parsed = sequence(
    optionalWhitespace,
    optional(ellipsis),
    declaration,
    optionalWhitespace,
    terminal(/^=/),
    optionalWhitespace,
    expression,
    optionalWhitespace,
    optional(extension)
  )(text);
  if (!parsed) {
    return null;
  }
  const { 2: left, 6: right } = parsed.value;
  const value = ["=", left, right];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a backtick-quoted string.
export function backtickQuoteString(text) {
  const parsed = sequence(
    optionalWhitespace,
    terminal(/^`/),
    backtickContents,
    terminal(/^`/)
  )(text);
  if (!parsed) {
    return null;
  }
  const { 2: contents } = parsed.value;
  // Drop empty strings.
  const filtered = contents.filter((item) => item !== "");
  const value = [ops.concat, ...filtered];
  return {
    value,
    rest: parsed.rest,
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

// Parse an ellipsis.
function ellipsis(text) {
  return terminal(/^…/)(text);
}

// Parse an eg expression.
export function expression(text) {
  return any(
    singleQuoteString,
    backtickQuoteString,
    indirectCall,
    group,
    spaceUrl,
    spacePathCall,
    protocolCall,
    slashCall,
    percentCall,
    functionCall,
    getReference
  )(text);
}

// Parse a file extension
export function extension(text) {
  return sequence(terminal(/^./), literal)(text);
}

// Parse a function call.
export function functionCall(text) {
  const parsed = sequence(optionalWhitespace, reference, args)(text);
  if (!parsed) {
    return null;
  }
  const { 1: fnName, 2: fnArgs } = parsed.value;
  let value = [[ops.graph, fnName]];
  if (fnArgs.length > 0) {
    value.push(...fnArgs);
  }
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a call to get a value.
export function getReference(text) {
  const parsed = reference(text);
  if (!parsed) {
    return null;
  }
  const value = [ops.graph, parsed.value];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a parenthetical group.
export function group(text) {
  const parsed = sequence(
    optionalWhitespace,
    lparen,
    optionalWhitespace,
    expression,
    optionalWhitespace,
    rparen
  )(text);
  if (!parsed) {
    return null;
  }
  const value = parsed.value[3]; // the expression
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse an indirect function call like `(fn)(arg1, arg2)`.
export function indirectCall(text) {
  const parsed = sequence(optionalWhitespace, group, args)(text);
  if (!parsed) {
    return null;
  }
  const value = [parsed.value[1], ...parsed.value[2]]; // function and args
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse an inheritable constant declaration or variable declaration.
export function inheritableDeclaration(text) {
  const parsed = sequence(ellipsis, declaration)(text);
  if (!parsed) {
    return null;
  }
  const value = ["=", parsed.value[1], [ops.graph, [ops.thisKey]]];
  return {
    value,
    rest: parsed.rest,
  };
}

// A key in an Explorable App
export function key(text) {
  return any(assignment, inheritableDeclaration, declaration)(text);
}

// Parse a comma-separated list with at least one term.
export function list(text) {
  const parsed = separatedList(
    expression,
    terminal(/^,/),
    optionalWhitespace
  )(text);
  if (!parsed) {
    return null;
  }
  // Remove the separators from the result.
  const value = [];
  while (parsed.value.length > 0) {
    value.push(parsed.value.shift()); // Keep value
    parsed.value.shift(); // Drop separator
  }
  return {
    value: value,
    rest: parsed.rest,
  };
}

// Parse a reference to a literal
export function literal(text) {
  // Literals are sequences of everything but terminal characters.
  return regex(/^[^=\(\)\{\}\$"'/:`%,\s]+/)(text);
}

// Parse a left parenthesis.
function lparen(text) {
  return terminal(/^\(/)(text);
}

// Parse the arguments to a function where the parentheses have been omitted.
export function omittedParensArgs(text) {
  const parsed = sequence(whitespace, list)(text);
  if (!parsed) {
    return null;
  }
  const value = parsed.value[1];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse an optional whitespace sequence.
export function optionalWhitespace(text) {
  return terminal(/^\s*/)(text);
}

// Parse function arguments enclosed in parentheses.
function parentheticalArgs(text) {
  const parsed = sequence(
    optionalWhitespace,
    lparen,
    optional(list),
    optionalWhitespace,
    rparen
  )(text);
  if (!parsed) {
    return null;
  }
  const listValue = parsed.value[2];
  const value =
    listValue === undefined ? undefined : listValue === null ? [] : listValue;
  return {
    value,
    rest: parsed.rest,
  };
}

// Top-level parse function parses a expression and returns just the value.
export default function parse(text) {
  const parsed = expression(text);
  return parsed?.rest !== "" ? parsed.value : null;
}

export function pathHead(text) {
  const parsed = any(indirectCall, group, functionCall, getReference)(text);
  if (!parsed) {
    return null;
  }
  let value = parsed.value;
  if (value[0] !== ops.graph) {
    value = [value];
  }
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a key in a path.
export function pathKey(text) {
  return any(group, reference)(text);
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
  const parsed = separatedList(pathKey, terminal(/^%/), regex(/^/))(text);
  if (!parsed) {
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

// Parse a right-associative protocol call like `fn:foo/bar` or `fn://foo/bar`.
export function protocolCall(text) {
  const parsed = sequence(
    optionalWhitespace,
    reference,
    terminal(/^:\/\/|^:/),
    any(protocolCall, slashPath)
  )(text);
  if (!parsed) {
    return null;
  }
  const { 1: fnName, 3: fnArgs } = parsed.value;
  const value = [[ops.graph, fnName]];
  const argIsNestedCall = fnArgs[0]?.[0] === ops.graph;
  if (argIsNestedCall) {
    value.push(fnArgs);
  } else {
    value.push(...fnArgs);
  }
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a reference to a variable or literal.
export function reference(text) {
  return any(thisReference, variableReference, literal)(text);
}

// Parse a right parenthesis.
function rparen(text) {
  return terminal(/^\)/)(text);
}

// Parse a single-quoted string.
export function singleQuoteString(text) {
  const parsed = sequence(optionalWhitespace, regex(/^'[^\']*'/))(text);
  if (!parsed) {
    return null;
  }
  // Remove quotes.
  const value = parsed.value[1].slice(1, -1);
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a function call with slash syntax.
export function slashCall(text) {
  const parsed = sequence(
    optionalWhitespace,
    optional(terminal(/\/\//)),
    pathHead,
    terminal(/^\//),
    optional(slashPath)
  )(text);
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
export function slashPath(text) {
  const parsed = separatedList(pathKey, terminal(/^\//), regex(/^/))(text);
  if (!parsed) {
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

// Parse a space-delimited path function call that starts with "." or ".."
export function spacePathCall(text) {
  const parsed = sequence(
    optionalWhitespace,
    regex(/^\.\.|\./),
    whitespace,
    spaceUrlPath
  )(text);
  if (!parsed) {
    return null;
  }
  const { 1: fnName, 3: fnArgs } = parsed.value;
  let value = [ops.graph, fnName];
  if (fnArgs) {
    value.push(...fnArgs);
  }
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a space-delimeted URL
export function spaceUrl(text) {
  const parsed = sequence(
    optionalWhitespace,
    spaceUrlProtocol,
    whitespace,
    spaceUrlPath
  )(text);
  if (!parsed) {
    return null;
  }
  const { 1: protocol, 3: path } = parsed.value;
  const value = [[ops.graph, protocol], ...path];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a URL protocol
export function spaceUrlProtocol(text) {
  return regex(/^https?/)(text);
}

// Parse a space-delimeted URL path
export function spaceUrlPath(text) {
  const parsed = separatedList(reference, whitespace, regex(/^/))(text);
  if (!parsed) {
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

// Parse a reference to "this".
export function thisReference(text) {
  const parsed = terminal(/^this/)(text);
  if (!parsed) {
    return null;
  }
  const value = [ops.thisKey];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a variable name
export function variableName(text) {
  // For now, use JavaScript identifier rules.
  return regex(/^[$A-Za-z_][A-Za-z0-9_$]*/)(text);
}

// Parse a variable declaration like ${x}.json
export function variableDeclaration(text) {
  const parsed = sequence(
    terminal(/^\{/),
    variableName,
    terminal(/^\}/),
    optional(literal)
  )(text);
  if (!parsed) {
    return null;
  }
  const { 1: variable, 3: extension } = parsed.value;
  const value = [ops.variable, variable, extension];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a variable reference like $foo.html
export function variableReference(text) {
  const parsed = sequence(
    terminal(/^\$\{/),
    variableName,
    terminal(/^\}/),
    optional(literal)
  )(text);
  if (!parsed) {
    return null;
  }
  const { 1: variable, 3: extension } = parsed.value;
  const value = [ops.variable, variable, extension];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a whitespace sequence.
export function whitespace(text) {
  return terminal(/^\s+/)(text);
}
