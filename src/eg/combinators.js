// Any combinator: return result of whichever parser matches first.
export function any(...parsers) {
  return function parseAny(text) {
    for (const parser of parsers) {
      const parsed = parser(text);
      if (parsed) {
        return parsed;
      }
    }
    return null;
  };
}

// Optional combinator: if the given parser succeeded, return its result,
// otherwise return a null value.
export function optional(parser) {
  return function parseOptional(text) {
    const parsed = parser(text);
    const value = parsed?.value ?? null;
    const rest = parsed?.rest ?? text;
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
      const parsed = parser(rest);
      if (!parsed) {
        return null;
      }
      value.push(parsed.value);
      rest = parsed.rest;
    }
    return { value, rest };
  };
}

export function separatedList(termParser, separatorParser, whitespaceParser) {
  return function parseSeparatedList(text) {
    const whitespace1 = whitespaceParser(text);
    let parsedTerm = termParser(whitespace1.rest);
    if (!parsedTerm) {
      return null;
    }
    const value = [parsedTerm.value];
    let rest;
    while (parsedTerm) {
      rest = parsedTerm.rest;
      const whitespace2 = whitespaceParser(parsedTerm.rest);
      const parsedSeparator = separatorParser(whitespace2.rest);
      if (parsedSeparator) {
        value.push(parsedSeparator.value);
        const whitespace3 = whitespaceParser(parsedSeparator.rest);
        parsedTerm = termParser(whitespace3.rest);
        if (parsedTerm) {
          value.push(parsedTerm.value);
        } else {
          // Trailing separator
          value.push(undefined);
          rest = parsedSeparator.rest;
        }
      } else {
        parsedTerm = null;
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
    const parsed = regex(terminalRegex)(text);
    if (!parsed) {
      return null;
    }
    return {
      value: null,
      rest: parsed.rest,
    };
  };
}
