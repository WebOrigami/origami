// Any combinator: return result of whichever parser matches first.
export function any(...parsers) {
  return function parseAny(text) {
    for (const parser of parsers) {
      const result = parser(text);
      if (result) {
        return result;
      }
    }
    return null;
  };
}

// Optional combinator: if the given parser succeeded, return its result,
// otherwise return a null value.
export function optional(parser) {
  return function parseOptional(text) {
    const result = parser(text);
    const value = result?.value ?? null;
    const rest = result?.rest ?? text;
    return {
      value,
      rest,
    };
  };
}

// Parse using the given regular expression.
export function regex(regex) {
  return function parseRegex(text) {
    const match = regex.exec(text);
    if (!match) {
      return null;
    }
    const value = match[0];
    const rest = text.slice(value.length);
    return {
      value,
      rest,
    };
  };
}

// Sequence combinator: succeeds if all the parsers succeed in turn.
// Returns an array with the results of the individual parsers.
export function sequence(...parsers) {
  return function parseSequence(text) {
    let rest = text;
    const value = [];
    for (const parser of parsers) {
      const result = parser(rest);
      if (!result) {
        return null;
      }
      value.push(result.value);
      rest = result.rest;
    }
    return { value, rest };
  };
}

export function separatedList(termParser, separatorParser, whitespaceParser) {
  return function parseSeparatedList(text) {
    const whitespace1 = whitespaceParser(text);
    let termResult = termParser(whitespace1.rest);
    if (!termResult) {
      return null;
    }
    const value = [termResult.value];
    let rest;
    while (termResult) {
      rest = termResult.rest;
      const whitespace2 = whitespaceParser(termResult.rest);
      const separatorResult = separatorParser(whitespace2.rest);
      if (separatorResult) {
        value.push(separatorResult.value);
        const whitespace3 = whitespaceParser(separatorResult.rest);
        termResult = termParser(whitespace3.rest);
        if (termResult) {
          value.push(termResult.value);
        }
      } else {
        termResult = null;
      }
    }
    return {
      value,
      rest,
    };
  };
}

// Parse a terminal value like a parenthesis.
// If successful, returns a null value to indicate we can throw away the value;
// we already know what it is.
export function terminal(terminalRegex) {
  return function parseTerminal(text) {
    const result = regex(terminalRegex)(text);
    if (!result) {
      return null;
    }
    return {
      value: null,
      rest: result.rest,
    };
  };
}
