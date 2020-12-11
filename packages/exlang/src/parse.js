import { argumentMarker } from "./execute.js";

const recognizers = [
  recognizeModuleImport,
  recognizeJsonImport,
  recognizeFunction,
  recognizeQuotedString,
  recognizeMarker,
];

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
  const { open, close, commas } = findArguments(text);
  if (open >= 0 || close > 0 || close === text.length - 1) {
    // Recognized a function call.
    const fnName = text.slice(0, open).trim();
    const argText = text.substring(open + 1, close).trim();
    const argStarts = [-1, ...commas];
    const args = argStarts.map((argStart, index) =>
      index === argStarts.length - 1
        ? // Remainder of argument text
          argText.substring(argStart + 1)
        : // Argument text goes to start of next argument
          argText.substring(argStart + 1, argStarts[index + 1] - 1)
    );
    const parsedArgs = args.map((arg) => parseExpression(arg));
    return [fnName, ...parsedArgs];
  }
}

function recognizeJsonImport(text) {
  if (text.startsWith(":") && text.endsWith(".json")) {
    // Recognized a module import.
    const fileName = text.substring(1);
    return ["parse", ["file", fileName]];
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

function recognizeQuotedString(text) {
  if (text.startsWith('"') && text.endsWith('"')) {
    const string = text.substring(1, text.length - 1);
    return string;
  }
}

// Given text that might be a function call, look for the outermost open and
// close parenthesis. If found, return `open` and `close` indices giving the
// location of those parenthesis. Also look for commas separating arguments;
// return a `commas` array indicating the location of those commas relative to
// the open parenthesis.
function findArguments(text) {
  const noMatch = { open: -1, close: -1 };
  const commas = [];
  let openParenIndex;
  let closeParenIndex;
  let inQuotedString = false;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    switch (c) {
      case "(":
        if (!inQuotedString) {
          depth++;
          if (openParenIndex === undefined) {
            openParenIndex = i;
          }
        }
        break;

      case ")":
        if (!inQuotedString) {
          if (depth === 0) {
            // Hit a close parenthesis before an open parenthesis.
            return noMatch;
          }
          depth--;
          closeParenIndex = i;
        }
        break;

      case '"':
        inQuotedString = !inQuotedString;
        break;

      case ",":
        if (!inQuotedString && openParenIndex >= 0 && depth === 1) {
          // Hit a comma in the argument list.
          // Record its position relative to the opening parenthesis.
          commas.push(i - openParenIndex);
        }
        break;
    }
  }

  if (depth !== 0) {
    // Missing at least one close parenthesis.
    return noMatch;
  }

  return { open: openParenIndex, close: closeParenIndex, commas };
}
