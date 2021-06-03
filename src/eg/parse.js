import { argumentMarker } from "./execute.js";

const recognizers = [
  recognizeQuotedString,
  recognizeModuleImport,
  recognizeJsonImport,
  recognizePath,
  recognizeFunction,
  recognizeMarker,
];

// Given text that might be a function call, look for the outermost open and
// close parenthesis. If found, return `open` and `close` indices giving the
// location of those parenthesis. Also look for commas separating arguments;
// return a `commas` array indicating the location of those commas relative to
// the open parenthesis.
function findArguments(text) {
  const noMatch = { open: -1, close: -1, commas: [] };
  const commas = [];
  let openParenIndex = -1;
  let closeParenIndex = -1;
  let treatSpaceAsOpenParen = false;
  let inQuotedString = false;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    switch (c) {
      case "(":
        if (!inQuotedString) {
          depth++;
          if (openParenIndex === -1) {
            openParenIndex = i;
          }
        }
        treatSpaceAsOpenParen = false;
        break;

      case " ":
        // Treat first space after normal characters as an open parenthesis.
        if (!inQuotedString && treatSpaceAsOpenParen) {
          depth++;
          if (openParenIndex === -1) {
            openParenIndex = i;
          }
        }
        treatSpaceAsOpenParen = false;
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
        treatSpaceAsOpenParen = false;
        break;

      case '"':
        inQuotedString = !inQuotedString;
        treatSpaceAsOpenParen = false;
        break;

      case ",":
        if (!inQuotedString && openParenIndex >= 0 && depth === 1) {
          // Hit a comma in the argument list.
          // Record its position relative to the opening parenthesis.
          commas.push(i - openParenIndex);
        }
        treatSpaceAsOpenParen = false;
        break;

      default:
        treatSpaceAsOpenParen = true;
    }
  }

  if (treatSpaceAsOpenParen || depth !== 0) {
    if (depth === 0) {
      // Treat entire text as a function call with no arguments.
      openParenIndex = text.length;
    }

    // Implicitly close any open parentheses.
    closeParenIndex = text.length;
  }

  return { open: openParenIndex, close: closeParenIndex, commas };
}

// Given a string and a graph of functions, return a parsed tree.
export default function parseExpression(text) {
  const trimmed = text.trim();
  for (const recognizer of recognizers) {
    const result = recognizer(trimmed);
    if (result !== undefined) {
      // Recognizer recognized something.
      return result;
    }
  }
  // Return the text as is.
  return trimmed;
}

function recognizeFunction(text) {
  const { open, close, commas } = findArguments(text);
  if (open >= 0 && (close > 0 || close === text.length - 1)) {
    // Recognized a function call.
    const fnName = text.slice(0, open).trim();
    const argText = text.substring(open + 1, close).trim();
    const argStarts = open + 1 < close ? [0, ...commas] : [];
    const args = argStarts.map((argStart, index) => {
      const argEnd =
        index === argStarts.length - 1 ? text.length : argStarts[index + 1] - 1;
      const arg = argText.substring(argStart, argEnd);
      return arg;
    });
    const parsedArgs = args.map((arg) => parseExpression(arg));
    return [fnName, ...parsedArgs];
  }
  return undefined;
}

function recognizeJsonImport(text) {
  // Match anything that ends in .json and has no whitespace.
  const jsonRegex = /^\S+.json$/;
  if (jsonRegex.test(text)) {
    // Recognized a JSON import.
    return ["parse", ["file", text]];
  }
  return undefined;
}

function recognizeMarker(text) {
  if (text === "*") {
    return argumentMarker;
  }
  return undefined;
}

function recognizeModuleImport(text) {
  // Match anything that ends in .js and has no whitespace.
  const moduleRegex = /^\S+.js$/;
  if (moduleRegex.test(text)) {
    // Recognized a module import.
    return ["defaultModuleExport", text];
  }
  return undefined;
}

function recognizePath(text) {
  // Match anything that contains a slash or a dot, and also contains no
  // whitespace or parentheses.
  const pathRegex = /^[^\(\)\s]*[\.\/][^\(\)\s]*$/;
  return pathRegex.test(text) ? text : undefined;
}

function recognizeQuotedString(text) {
  if (text.startsWith('"') && text.endsWith('"')) {
    const string = text.substring(1, text.length - 1);
    return string;
  }
  return undefined;
}
