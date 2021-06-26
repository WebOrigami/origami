export function args(text) {
  const result1 = whitespace(text);
  const lparenResult = lparen(result1.rest);
  if (lparenResult.value) {
    const listResult = list(lparenResult.rest);
    const result2 = whitespace(listResult.rest);
    const rparenResult = rparen(result2.rest);
    if (rparenResult.value) {
      return {
        value: listResult.value,
        rest: rparenResult.rest,
      };
    } else {
      return {
        value: undefined,
        rest: rparenResult.rest,
      };
    }
  }
  return list(text);
}

export function doubleQuoteString(text) {
  const doubleQuoteMatch = match(text, /^"[^\"]*"/);
  if (doubleQuoteMatch.value) {
    return {
      value: doubleQuoteMatch.value.slice(1, -1),
      rest: doubleQuoteMatch.rest,
    };
  }
  return doubleQuoteMatch;
}

export function expression(text) {
  const result1 = whitespace(text);
  const lparenResult = lparen(result1.rest);
  if (lparenResult.value) {
    const expressionResult = expression(lparenResult.rest);
    const rparenResult = rparen(expressionResult.rest);
    if (rparenResult.value) {
      return {
        value: expressionResult.value,
        rest: rparenResult.rest,
      };
    } else {
      return {
        value: undefined,
        rest: rparenResult.reset,
      };
    }
  }
  const doubleQuoteResult = doubleQuoteString(result1.rest);
  if (doubleQuoteResult.value) {
    return doubleQuoteResult;
  }
  const singleQuoteResult = singleQuoteString(result1.rest);
  if (singleQuoteResult.value) {
    return singleQuoteResult;
  }
  return functionCall(result1.rest);
}

export function functionCall(text) {
  const result1 = whitespace(text);
  const referenceResult = reference(result1.rest);
  if (referenceResult.value) {
    const value = [referenceResult.value];
    const argsResult = args(referenceResult.rest);
    if (argsResult.value) {
      value.push(...argsResult.value);
      return {
        value,
        rest: argsResult.rest,
      };
    }
  }
  return referenceResult;
}

export function list(text) {
  const args = [];
  const result1 = whitespace(text);
  let expressionResult = expression(result1.rest);
  while (expressionResult.value) {
    args.push(expressionResult.value);
    const result3 = whitespace(expressionResult.rest);
    const result4 = match(result3.rest, /,/);
    if (result4.value) {
      const result5 = whitespace(result4.rest);
      expressionResult = expression(result5.rest);
    } else {
      expressionResult = { value: undefined, rest: result4.rest };
    }
  }
  return {
    value: args,
    rest: expressionResult.rest,
  };
}

function lparen(text) {
  return match(text, /^\(/);
}

function match(text, regex) {
  const match = regex.exec(text);
  const value = match ? match[0] : undefined;
  const rest = match ? text.slice(value.length) : text;
  return {
    value,
    rest,
  };
}

export function reference(text) {
  // References are sequences of everything but terminal characters.
  return match(text, /^[^=\(\)"',\s]+/);
}

function rparen(text) {
  return match(text, /^\)/);
}

export function singleQuoteString(text) {
  const singleQuoteMatch = match(text, /^'[^\']*'/);
  if (singleQuoteMatch.value) {
    return {
      value: singleQuoteMatch.value.slice(1, -1),
      rest: singleQuoteMatch.rest,
    };
  }
  return singleQuoteMatch;
}

export function statement(text) {
  const result1 = whitespace(text);
  const referenceResult = reference(result1.rest);
  if (referenceResult.value) {
    const result2 = whitespace(referenceResult.rest);
    const equalsResult = match(result2.rest, /=/);
    if (equalsResult.value) {
      const expressionResult = expression(equalsResult.rest);
      if (expressionResult) {
        const value = ["=", referenceResult.value, expressionResult.value];
        return {
          value,
          rest: expressionResult.rest,
        };
      }
    }
  }
  return expression(text);
}

export function whitespace(text) {
  return match(text, /^\s+/);
}
