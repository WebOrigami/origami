import { Explorable } from "@explorablegraph/exfn";

// Given a string and a graph of functions, return a parsed tree.
export default function parseExpression(text) {
  const trimmed = text.trim();
  const { open, close } = getOutermostParenthesis(trimmed);
  if (open === -1 || close === -1 || close !== trimmed.length - 1) {
    // Return the whole text as an argument to the String constructor.
    return Explorable({
      String: trimmed,
    });
  }

  const fnName = trimmed.slice(0, open).trim();

  const argText = trimmed.substring(open + 1, close).trim();
  const arg = parseExpression(argText);

  return Explorable({
    [fnName]: arg,
  });
}

function getOutermostParenthesis(text) {
  const noMatch = { open: -1, close: -1 };
  let openParenIndex;
  let closeParenIndex;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    switch (c) {
      case "(":
        depth++;
        if (openParenIndex === undefined) {
          openParenIndex = i;
        }
        break;

      case ")":
        if (depth === 0) {
          // Hit a close parenthesis before an open parenthesis.
          return noMatch;
        }
        depth--;
        closeParenIndex = i;
        break;
    }
  }

  if (depth !== 0) {
    // Missing at least one close parenthesis.
    return noMatch;
  }

  return { open: openParenIndex, close: closeParenIndex };
}
