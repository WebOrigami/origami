/* Generate trace links and results for debugger */

import { ops, symbols } from "@weborigami/language";
const { traceSymbol } = symbols;

export function traceLinks(result, basePath = "") {
  const { code, inputs } = result[traceSymbol];
  const text = code.location.source.text;
  const flags = inputFlags(result);

  // Construct link data for this level of the result
  const spans = code
    .slice(1) // Drop function
    .filter((entry, index) => entry instanceof Array && flags[index])
    .map((entry, index) => ({
      end: entry.location.end.offset,
      index,
      start: entry.location.start.offset,
    }));
  spans.sort((a, b) => a.start - b.start);

  const fragments = [];

  // Grab initial indentation so that lines after the first line up
  const codeStart = code.location.start;
  const startOfLine = text.slice(
    codeStart.offset - codeStart.column + 1,
    codeStart.offset
  );
  const indentation = startOfLine.match(/^\s*/)[0];

  let i = code.location.start.offset;
  for (const { end, index, start } of spans) {
    if (i < start || (index === 0 && indentation)) {
      fragments.push({
        text: indentation + text.slice(i, start),
      });
    }
    fragments.push({
      path: `${basePath}/${index}`,
      text: text.slice(start, end),
    });
    i = end;
  }
  if (i < code.location.end.offset) {
    fragments.push({
      text: text.slice(i, code.location.end.offset),
    });
  }

  // const inputCode = input[codeSymbol];
  // const inputLocation = inputCode.location;
  // const inputSourceText = inputLocation.source.text;
  // const sourceDiffers =
  //   inputSourceText !== sourceText ||
  //   inputLocation.start.offset < location.start.offset ||
  //   inputLocation.start.offset > location.end.offset ||
  //   inputLocation.end.offset < location.start.offset ||
  //   inputLocation.end.offset > location.end.offset;
  // const path = `${basePath}/${index}`;

  // Gather link info for inputs
  const inputLinks = inputs
    .filter((input, index) => flags[index])
    .map((input, index) => traceLinks(input, `${basePath}/${index}`));

  return {
    value: fragments,
    ...inputLinks,
  };
}

export function resultDecomposition(result) {
  const { inputs } = result[traceSymbol];
  const flags = inputFlags(result);
  const inputDecompositions = inputs
    .filter((input, index) => flags[index])
    .map(resultDecomposition);
  return {
    value: result,
    ...inputDecompositions,
  };
}

// Return an array of flags indicating whether the input with corresponding
// index should be used.
function inputFlags(result) {
  const { code, inputs } = result[traceSymbol];
  return inputs.map((input, index) => {
    if (typeof input !== "object" || input[traceSymbol] === undefined) {
      // Primitive value, don't use
      return false;
    }
    if (
      index === 0 &&
      code[0]?.[0] === ops.builtin &&
      code[0]?.[1] === "indent"
    ) {
      // Ignore template strings
      return false;
    }
    return true;
  });
}
