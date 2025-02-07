/* Generate trace links and results for debugger */

import { ops, symbols } from "@weborigami/language";
const { traceSymbol } = symbols;

// Return an array of flags indicating whether the input with corresponding
// index should be used.
function inputFlags(code, inputs) {
  return inputs.map((input, index) => {
    // Ignore primitive or untraced values
    if (typeof input !== "object" || input[traceSymbol] === undefined) {
      return false;
    }

    // Ignore template strings
    if (
      index === 0 &&
      ((code[0]?.[0] === ops.builtin && code[0]?.[1] === "indent") ||
        code[0]?.[0] === ops.template)
    ) {
      return false;
    }

    // Only use first arg of ops.external
    if (index === 0 && code[0] === ops.external) {
      return false;
    }

    return true;
  });
}

function linksForTrace(trace, basePath = "") {
  const { call, code, inputs } = trace;
  const text = code.location.source.text;
  const flags = inputFlags(code, inputs);

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

  // Gather link info for inputs
  const inputLinks = inputs
    .filter((input, index) => flags[index])
    .map((input, index) =>
      linksForTrace(input[traceSymbol], `${basePath}/${index}`)
    );

  const data = {
    value: fragments,
    ...inputLinks,
  };

  if (call) {
    data.call = linksForTrace(call, `${basePath}/call`);
  }

  return data;
}

export function resultDecomposition(result, trace = result[traceSymbol]) {
  const { call, code, inputs } = trace;
  const flags = inputFlags(code, inputs);
  const inputDecompositions = inputs
    .filter((input, index) => flags[index])
    .map((input) => resultDecomposition(input));

  const data = {
    value: result,
    ...inputDecompositions,
  };

  if (call) {
    data.call = resultDecomposition(result, call);
  }

  return data;
}

export function traceLinks(result) {
  return linksForTrace(result[traceSymbol]);
}
