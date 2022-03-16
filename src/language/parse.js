/**
 * Parse statements in the Origami expression language.
 *
 * See https://explorablegraph.org/language/grammar.html for a formal grammar.
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
import * as ops from "./ops.js";

// Parse arguments to a function, with either explicit or implicit parentheses.
export function args(text) {
  return any(parensArgs, implicitParensArgs)(text);
}

// Parse a chain of arguments like `(arg1)(arg2)(arg3)`.
export function argsChain(text) {
  return series(args)(text);
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

// Parse a declaration.
export function declaration(text) {
  return any(variableDeclaration, literal)(text);
}

// Parse an ellipsis.
function ellipsis(text) {
  return terminal(/^…/)(text);
}

// Parse an Origami expression.
export function expression(text) {
  return any(
    singleQuoteString,
    lambda,
    templateLiteral,
    spaceUrl,
    spacePathCall,
    functionComposition,
    protocolCall,
    slashCall,
    percentCall,
    group,
    number,
    getReference
  )(text);
}

// Parse a file extension
export function extension(text) {
  return sequence(terminal(/^./), literal)(text);
}

// Parse something that results in a function/graph that can be called.
export function functionCallTarget(text) {
  return any(group, protocolCall, slashCall, percentCall, getReference)(text);
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
export function getReference(text) {
  const parsed = reference(text);
  if (!parsed) {
    return null;
  }
  const value = [ops.scope, parsed.value];
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

// Parse an inheritable constant declaration or variable declaration.
export function inheritableDeclaration(text) {
  const parsed = sequence(ellipsis, declaration)(text);
  if (!parsed) {
    return null;
  }
  const value = ["=", parsed.value[1], [ops.scope, [ops.thisKey]]];
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse the arguments to a function where the parentheses have been omitted.
export function implicitParensArgs(text) {
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

// A key in an Explorable App
export function key(text) {
  return any(assignment, inheritableDeclaration, declaration)(text);
}

// A lambda expression
export function lambda(text) {
  const parsed = sequence(
    optionalWhitespace,
    terminal(/^=>/),
    optionalWhitespace,
    expression
  )(text);
  if (!parsed) {
    return null;
  }
  const value = [ops.lambda, parsed.value[3]];
  return {
    value,
    rest: parsed.rest,
  };
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

export function number(text) {
  // Based on https://stackoverflow.com/a/51733563/76472
  // but only accepts integers or floats, not exponential notation.
  const parsed = regex(/^-?\d+(?:\.\d*)?|\.\d+/)(text);
  if (!parsed) {
    return null;
  }
  const value = Number(parsed.value);
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
function parensArgs(text) {
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
  return any(group, substitution, literal)(text);
}

// Parse a path key that contains substitutions

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
  const value = [[ops.scope, fnName]];
  const argIsNestedCall = fnArgs[0]?.[0] === ops.scope;
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

// Parse a reference to a variable or literal.
export function reference(text) {
  return any(thisReference, variableReference, literal)(text);
}

// Parse a right parenthesis.
function rparen(text) {
  return terminal(/^\)/)(text);
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

// Parse a single-quoted string.
export function singleQuoteString(text) {
  const parsed = sequence(
    optionalWhitespace,
    terminal(/^'/),
    quotedTextWithEscapes,
    terminal(/^'/)
  )(text);
  if (!parsed) {
    return null;
  }
  // Remove quotes.
  const { 2: value } = parsed.value;
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse a function call with slash syntax.
export function slashCall(text) {
  const parsed = sequence(
    optionalWhitespace,
    optional(terminal(/^\/\//)),
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
  let value = [ops.scope, fnName];
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
  const value = [[ops.scope, protocol], ...path];
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
  const parsed = separatedList(pathKey, whitespace, regex(/^/))(text);
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

// Parse a substitution like {{foo}} found in an backtick template.
export function substitution(text) {
  const parsed = sequence(
    terminal(/^\{\{/),
    optionalWhitespace,
    expression,
    optionalWhitespace,
    terminal(/^\}\}/)
  )(text);
  if (!parsed) {
    return null;
  }
  const { 2: value } = parsed.value;
  return {
    value,
    rest: parsed.rest,
  };
}

// Parse the text and variable references in a template.
function templateParser(allowBackticks) {
  const textParser = templateTextParser(allowBackticks);
  return function template(text) {
    // It's a stretch to use the separated list parser for this, but it works. We
    // treat the plain text as the list items, and the substitutions as
    // separators.
    const parsed = separatedList(
      optional(textParser),
      substitution,
      regex(/^/)
    )(text);
    if (!parsed) {
      return null;
    }
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
  };
}

// Parse a template document.
export function templateDocument(text) {
  const allowBackticks = true;
  return templateParser(allowBackticks)(text);
}

// Parse a backtick-quoted template literal.
export function templateLiteral(text) {
  const allowBackticks = false;
  const parsed = sequence(
    optionalWhitespace,
    terminal(/^`/),
    templateParser(allowBackticks),
    terminal(/^`/)
  )(text);
  if (!parsed) {
    return null;
  }
  const { 2: value } = parsed.value;
  return {
    value,
    rest: parsed.rest,
  };
}

// Return a parser for the text of a template.
function templateTextParser(allowBackticks) {
  return function templateText(text) {
    // Match up to the first backtick (if backticks aren't allowed) or double
    // left curly bracket. This seems challenging/impossible in JavaScript
    // regular expressions, especially without support for lookbehind
    // assertions, so we match this by hand.
    let i;
    let value = "";
    for (i = 0; i < text.length; i++) {
      const char = text[i];
      if (
        (char === "`" && !allowBackticks) ||
        (char === "{" && text[i + 1] === "{")
      ) {
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
    return i > 0 ? { value, rest } : null;
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
