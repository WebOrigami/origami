/* Generate trace links and results for debugger */

import { trailingSlash } from "@weborigami/async-tree";
import {
  taggedTemplateIndent as indent,
  ops,
  symbols,
} from "@weborigami/language";
const { traceSymbol } = symbols;

// Return an array of flags indicating whether the input with corresponding
// index should be used.
function inputFlags(code, inputs) {
  return inputs.map((input, index) => {
    // Ignore primitive or untraced values
    if (typeof input !== "object" || input[traceSymbol] === undefined) {
      return false;
    }

    // For now ignore functions
    if (typeof input === "function") {
      return false;
    }

    // Ignore the template strings argument in template literals
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

function inputData(inputTrace, inputPath) {
  // Get HTML for the input itself
  const { call, code } = inputTrace;
  const inputSource = code.location.source.text.slice(
    code.location.start.offset,
    code.location.end.offset
  );
  const inputHtml = `<span data-href="${inputPath}">${inputSource}</span>`;

  if (call) {
    const callPath = `${trailingSlash.remove(inputPath)}/-`;
    // Wrap input with a link to the call
    const html = `<span data-href="${callPath}">⎆${inputHtml}</span>`;
    const calls = resultHtml(call, callPath);
    return {
      calls,
      html,
    };
  } else {
    return {
      calls: "",
      html: inputHtml,
    };
  }
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
    data["-"] = resultDecomposition(result, call);
  }

  return data;
}

function resultHtml(resultTrace, basePath) {
  const { code, inputs } = resultTrace;
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

  // Full source for comment
  const source = text.slice(
    code.location.start.offset,
    code.location.end.offset
  );
  let html = indent`
    <!-- ${source} -->
    <section data-prefix="${basePath}">
      <span data-href="${basePath}">`;
  let calls = "";

  let i = code.location.start.offset;
  for (let spanIndex = 0; spanIndex < spans.length; spanIndex++) {
    const { end, input, start } = spans[spanIndex];

    // Add fragment for the text before this input
    if (i < start) {
      html += text.slice(i, start);
    }

    // Add span for the input
    const inputPath = `${trailingSlash.remove(basePath)}/${spanIndex}`;
    const { calls: inputCalls, html: inputHtml } = inputData(
      input[traceSymbol],
      inputPath
    );
    html += inputHtml;
    if (inputCalls) {
      calls += inputCalls;
    }

    i = end;
  }

  // Add fragment for text after last input
  if (i < code.location.end.offset) {
    html += text.slice(i, code.location.end.offset);
  }

  // Close the span and section
  html += "</span>\n</section>\n";

  // Add any calls
  html += calls;

  return html;
}

export function traceHtml(result, basePath) {
  // Grab initial indentation so that lines after the first line up
  // const codeStart = code.location.start;
  // const startOfLine = text.slice(
  //   codeStart.offset - codeStart.column + 1,
  //   codeStart.offset
  // );
  // const indentation = startOfLine.match(/^\s*/)[0];

  return resultHtml(result[traceSymbol], basePath);
}
