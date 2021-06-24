const importRecognizers = [
  recognizeModuleImport,
  recognizeJsonImport,
  recognizeYamlImport,
];

const recognizers = [
  recognizeDoubleQuotedString,
  recognizeSingleQuotedString,
  ...importRecognizers,
  recognizeUrl,
  recognizePath,
  recognizeAssignment,
  recognizeFunction,
];

const javascriptIdentifierRegex = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;

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

// If the given text represents an import of the file type indicated by the
// extension, then create an import representation that can be invoked to import
// that file.
function handleImportWithExtension(text, extension, createImport) {
  if (!text.endsWith(extension)) {
    // Didn't find extension.
    return undefined;
  }
  const fileName = text.slice(0, -extension.length).trim();
  if (fileName === "") {
    // No file name.
    return undefined;
  }
  const importResult = createImport(text);
  const assignment = recognizeAssignment(fileName);
  return assignment?.length === 2
    ? // Assignment from import
      [...assignment, importResult]
    : // Normal import
      importResult;
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

function recognizeAssignment(text) {
  const assignmentRegex = /^(?<left>[^=\s]+)[ \t]*=[ \t]*(?<right>.+)?$/;
  const match = assignmentRegex.exec(text);
  if (match) {
    const left = match.groups?.left;
    const right = match.groups?.right;
    const parsedRight = right ? parseExpression(right) : undefined;
    const result = ["=", left];
    if (parsedRight) {
      result.push(parsedRight);
    }
    return result;
  }
  return undefined;
}

function recognizeDoubleQuotedString(text) {
  if (text.startsWith('"') && text.endsWith('"')) {
    const string = text.substring(1, text.length - 1);
    return string;
  }
  return undefined;
}

function recognizeFunction(text) {
  const { open, close, commas } = findArguments(text);
  if (open >= 0 && (close > 0 || close === text.length - 1)) {
    const fnName = text.slice(0, open).trim();

    // Function must be a valid JavaScript identifier or a path that imports a
    // graph.
    const fn = javascriptIdentifierRegex.test(fnName)
      ? // Name is the name of a function
        fnName
      : // Name is a path to a graph
        recognizeImport(fnName);

    if (!fn) {
      // Invalid function name.
      return undefined;
    }

    // Recognized a function call.
    const argText = text.substring(open + 1, close).trim();
    const argStarts = open + 1 < close ? [0, ...commas] : [];
    const args = argStarts.map((argStart, index) => {
      const argEnd =
        index === argStarts.length - 1 ? text.length : argStarts[index + 1] - 1;
      const arg = argText.substring(argStart, argEnd);
      return arg;
    });
    const parsedArgs = args.map((arg) => parseExpression(arg));
    return [fn, ...parsedArgs];
  }
  return undefined;
}

function recognizeImport(text) {
  for (const recognizer of importRecognizers) {
    const result = recognizer(text);
    if (result !== undefined) {
      // Recognizer recognized something.
      return result;
    }
  }
  return undefined;
}

function recognizeJsonImport(text) {
  return handleImportWithExtension(text, ".json", (fileName) => [
    "parseJson",
    ["file", ["resolvePath", fileName]],
  ]);
}

function recognizeModuleImport(text) {
  return handleImportWithExtension(text, ".js", (fileName) => [
    "defaultModuleExport",
    ["resolvePath", fileName],
  ]);
}

function recognizeUrl(text) {
  // Anything that starts with an optional protocol (like https:) and // counts
  // as a URL.
  const urlRegex = /^(?:[a-z]+:)?\/\/.+/;
  return urlRegex.test(text) ? ["site", text] : undefined;
}

function recognizePath(text) {
  // Match anything that contains a slash or a dot, and also contains no
  // whitespace or parentheses.
  const pathRegex = /^[^\(\)\s]*[\.\/][^\(\)\s]*$/;
  return pathRegex.test(text) ? text : undefined;
}

function recognizeSingleQuotedString(text) {
  if (text.startsWith(`'`) && text.endsWith(`'`)) {
    const string = text.substring(1, text.length - 1);
    return string;
  }
  return undefined;
}

function recognizeYamlImport(text) {
  return handleImportWithExtension(text, ".yaml", (fileName) => [
    "parseYaml",
    ["file", ["resolvePath", fileName]],
  ]);
}
