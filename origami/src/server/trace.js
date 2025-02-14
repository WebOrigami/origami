/* Generate trace links and results for debugger */

import { trailingSlash } from "@weborigami/async-tree";
import {
  taggedTemplateIndent as indent,
  ops,
  symbols,
} from "@weborigami/language";
const { traceSymbol } = symbols;

function contextData(contextTrace, basePath) {
  const { call, code, inputs } = contextTrace;
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
      html += `<span>${escapeXml(text.slice(i, start))}</span>`;
    }

    // Add span for the input
    const inputPath = `${trailingSlash.remove(basePath)}/${spanIndex}`;
    const { contexts: inputContexts, html: inputHtml } = inputData(
      input[traceSymbol],
      inputPath
    );
    if (html) {
      html += "\n";
    }
    html += inputHtml;
    if (inputContexts) {
      contexts += inputContexts;
    }

    i = end;
  }

  // Add fragment for text after last input
  if (i < code.location.end.offset) {
    html += `<span>${escapeXml(
      text.slice(i, code.location.end.offset)
    )}</span>`;
  }

  // Wrap in link
  html = indent`
    <debug-link href="${basePath}">
      ${html}
    </debug-link>
  `;

  if (call) {
    contexts += contextHtml(call, basePath);
  }

  return {
    contexts,
    html,
  };
}

function contextHtml(contextTrace, basePath) {
  // Full source for comment
  const { code } = contextTrace;
  const text = code.location.source.text;
  // Don't convert whitespace to keep the comment legible
  const source = text.slice(
    code.location.start.offset,
    code.location.end.offset
  );

  const data = contextData(contextTrace, basePath);

  // Include comment, wrap in pre
  let html = indent`
    <!-- ${source} -->
    <debug-context href="${basePath}">
      ${data.html}
    </debug-context>
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

// Replace explicit whitespace with HTML
function explicitWhitespace(text) {
  return text
    .replace(/ /g, "&nbsp;")
    .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
    .replace(/\n/g, "<br>");
}

function inputData(inputTrace, inputPath) {
  // Get HTML for the input itself
  const { call, code } = inputTrace;
  const inputSource = code.location.source.text.slice(
    code.location.start.offset,
    code.location.end.offset
  );
  const escaped = escapeXml(inputSource);
  const html = indent`
    <debug-link href="${inputPath}">
      ${escaped}
    </debug-link>
  `;

  const contexts = call ? contextHtml(call, inputPath) : "";

  return {
    contexts,
    html,
  };
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

  if (call) {
    return resultDecomposition(result, call);
  }

  if (inputs[0] === ops.concat) {
    // Elide ops.concat from decomposition
    return resultDecomposition(inputs[1]);
  }

  const flags = inputFlags(code, inputs);
  const inputDecompositions = inputs
    .filter((input, index) => flags[index])
    .map((input) => resultDecomposition(input));

  const data = {
    value: result,
    ...inputDecompositions,
  };

  return data;
}

export function traceHtml(result, basePath) {
  return contextHtml(result[traceSymbol], basePath);
}
