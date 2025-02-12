/* Generate trace links and results for debugger */

import { trailingSlash } from "@weborigami/async-tree";
import {
  taggedTemplateIndent as indent,
  ops,
  symbols,
} from "@weborigami/language";
const { traceSymbol } = symbols;

function addCallData(callTrace, basePath, data) {
  const callPath = `${trailingSlash.remove(basePath)}/-`;
  // Wrap input with a link to the call
  const callHtml = `<span data-href="${callPath}">⎆${data.html}</span>`;
  const contexts = data.contexts + contextHtml(callTrace, callPath);
  return {
    contexts,
    html: callHtml,
  };
}

function contextData(contextTrace, basePath) {
  const { code, inputs } = contextTrace;
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

  let html = "";
  let contexts = "";

  let i = code.location.start.offset;
  for (let spanIndex = 0; spanIndex < spans.length; spanIndex++) {
    const { end, input, start } = spans[spanIndex];

    // Add fragment for the text before this input
    if (i < start) {
      html += escapeXml(text.slice(i, start));
    }

    // Add span for the input
    const inputPath = `${trailingSlash.remove(basePath)}/${spanIndex}`;
    const { contexts: inputContexts, html: inputHtml } = inputData(
      input[traceSymbol],
      inputPath
    );
    html += inputHtml;
    if (inputContexts) {
      contexts += inputContexts;
    }

    i = end;
  }

  // Add fragment for text after last input
  if (i < code.location.end.offset) {
    html += escapeXml(text.slice(i, code.location.end.offset));
  }

  // Wrap in span
  html = indent`<span data-href="${basePath}">${html}</span>`;

  const data = {
    contexts,
    html,
  };

  return contextTrace.call
    ? addCallData(contextTrace.call, basePath, data)
    : data;
}

function contextHtml(contextTrace, basePath) {
  // Full source for comment
  const { code } = contextTrace;
  const text = code.location.source.text;
  const source = escapeXml(
    text.slice(code.location.start.offset, code.location.end.offset)
  );

  const data = contextData(contextTrace, basePath);

  // Include comment, wrap in pre
  let html = indent`
    <!-- ${source} -->
    <pre data-prefix="${basePath}">
      ${data.html}
    </pre>
  `;

  // Add any contexts
  html += data.contexts;

  return html;
}

// Escape XML entities for in the text.
function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function inputData(inputTrace, inputPath) {
  // Get HTML for the input itself
  const { call, code } = inputTrace;
  const inputSource = code.location.source.text.slice(
    code.location.start.offset,
    code.location.end.offset
  );
  const escaped = escapeXml(inputSource);
  const html = `<span data-href="${inputPath}">${escaped}</span>`;

  const data = {
    contexts: "",
    html,
  };

  return call ? addCallData(call, inputPath, data) : data;
}

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

export function traceHtml(result, basePath) {
  // Grab initial indentation so that lines after the first line up
  // const codeStart = code.location.start;
  // const startOfLine = text.slice(
  //   codeStart.offset - codeStart.column + 1,
  //   codeStart.offset
  // );
  // const indentation = startOfLine.match(/^\s*/)[0];

  return contextHtml(result[traceSymbol], basePath);
}
