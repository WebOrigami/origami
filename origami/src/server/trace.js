/* Generate trace links and results for debugger */

import { ops, symbols } from "@weborigami/language";
const { traceSymbol } = symbols;

// Return an array of flags indicating whether the input with corresponding
// index should be used.
function inputFlags(code, inputs) {
  return inputs.map((input, index) => {
    // For now, ignore input 0, which is the function being called
    if (index === 0) {
      return false;
    }

    // Ignore primitive or untraced values
    if (typeof input !== "object" || input[traceSymbol] === undefined) {
      return false;
    }

    // Ignore template strings
    if (
      code[0]?.[0] === ops.template ||
      (code[0]?.[0] === ops.builtin && code[0]?.[1] === "indent")
    ) {
      return index !== 1;
    }

    // Only use first arg of ops.external
    if (code[0] === ops.external) {
      return index === 1;
    }

    return true;
  });
}

function linksForTrace(trace, basePath = "") {
  const { code, inputs } = trace;
  const text = code.location.source.text;
  const flags = inputFlags(code, inputs);

  // Construct link data for this level of the result
  const spans = code
    .map((entry, index) => {
      if (entry instanceof Array && flags[index]) {
        return {
          end: entry.location.end.offset,
          input: inputs[index],
          start: entry.location.start.offset,
        };
      }
      return null;
    })
    .filter((span) => span !== null)
    .sort((a, b) => a.start - b.start);

  const fragments = [];
  const calls = {};

  // Grab initial indentation so that lines after the first line up
  const codeStart = code.location.start;
  const startOfLine = text.slice(
    codeStart.offset - codeStart.column + 1,
    codeStart.offset
  );
  const indentation = startOfLine.match(/^\s*/)[0];

  let i = code.location.start.offset;
  for (let spanIndex = 0; spanIndex < spans.length; spanIndex++) {
    const { end, input, start } = spans[spanIndex];
    const inputTrace = input[traceSymbol];
    // spanIndex is also the index of the result
    const resultPath = `${basePath}/${spanIndex}`;

    // Add fragment for indendation and text before this input
    if (i < start || (spanIndex === 0 && indentation)) {
      fragments.push({
        text: indentation + text.slice(i, start),
      });
    }

    // If input is result of function call, add fragment and links for that call
    if (inputTrace.call) {
      const callPath = `${resultPath}/0`;
      fragments.push({
        text: "⎆",
        path: callPath,
      });
      calls[callPath] = linksForTrace(inputTrace.call, callPath);
    }

    // Add fragments for the input
    const inputLinks = linksForTrace(inputTrace, resultPath);
    fragments.push(...inputLinks.fragments);
    if (inputLinks.calls) {
      Object.assign(calls, inputLinks.calls);
    }

    i = end;
  }

  // Add fragment for text after last input
  if (i < code.location.end.offset) {
    fragments.push({
      text: text.slice(i, code.location.end.offset),
    });
  }

  const data = {
    fragments,
  };
  if (Object.keys(calls).length > 0) {
    data.calls = calls;
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
