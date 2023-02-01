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

export function empty(text) {
  return {
    value: null,
    rest: text,
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

// Parse a list of terms separated by a separator. This parser always succeeds
// -- if there are no terms, it returns an empty array as the value.
export function separatedList(termParser, separatorParser) {
  return function parseSeparatedList(text) {
    const value = [];
    let parsedTerm = termParser(text);
    let rest = parsedTerm?.rest ?? text;
    while (parsedTerm) {
      value.push(parsedTerm.value);
      rest = parsedTerm.rest;
      const parsedSeparator = separatorParser(parsedTerm.rest);
      if (!parsedSeparator) {
        // Reached end of list
        break;
      }
      value.push(parsedSeparator.value);
      rest = parsedSeparator.rest;
      parsedTerm = termParser(parsedSeparator.rest);
      if (!parsedTerm) {
        // There's a trailing separator, which we indicate by
        // ending the list with an undefined value.
        value.push(undefined);
        break;
      }
    }
    return {
      value,
      rest,
    };
  };
}

// Parse a consecutive series of at least one instance of the given term.
export function series(termParser) {
  return function parseSeries(text) {
    let parsedTerm = termParser(text);
    if (!parsedTerm) {
      return null;
    }
    const value = [];
    let rest;
    while (parsedTerm) {
      value.push(parsedTerm.value);
      rest = parsedTerm.rest;
      parsedTerm = termParser(rest);
    }
    return {
      value,
      rest,
    };
  };
}

// Parse a terminal value like a parenthesis.
// If successful, returns a true value to indicate we can throw away the value;
// we already know what it is.
export function terminal(terminalRegex) {
  return function parseTerminal(text) {
    const parsed = regex(terminalRegex)(text);
    if (!parsed) {
      return null;
    }
    return {
      value: true,
      rest: parsed.rest,
    };
  };
}
