import { argumentMarker } from "./execute.js";

const recognizers = [recognizeModuleImport, recognizeFunction, recognizeMarker];

// Given a string and a graph of functions, return a parsed tree.
export default function parseExpression(text) {
  const trimmed = text.trim();
  for (const recognizer of recognizers) {
    const result = recognizer(trimmed);
    if (result) {
      // Recognizer recognized something.
      return result;
    }
  }
  // Return the text as is.
  return trimmed;
}

function recognizeFunction(text) {
  const { open, close } = getOutermostParenthesis(text);
  if (open >= 0 || close > 0 || close === text.length - 1) {
    // Recognized a function call.
    const fnName = text.slice(0, open).trim();
    const argText = text.substring(open + 1, close).trim();
    const parsedArgs = parseExpression(argText);
    return [fnName, parsedArgs];
  }
}

function recognizeMarker(text) {
  if (text === "*") {
    return argumentMarker;
  }
}

function recognizeModuleImport(text) {
  if (text.startsWith(":") && text.endsWith(".js")) {
    // Recognized a module import.
    const moduleName = text.substring(1);
    return ["defaultModuleExport", moduleName];
  }
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
