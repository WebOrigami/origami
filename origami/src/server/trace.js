/* Generate trace links and results for debugger */

import {
  isPlainObject,
  isPrimitive,
  isStringLike,
  toString,
  trailingSlash,
  Tree,
} from "@weborigami/async-tree";
import {
  taggedTemplateIndent as indent,
  ops,
  symbols,
} from "@weborigami/language";
const { traceSymbol } = symbols;

const callMarker = "-";

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
  const path = call ? joinPath(basePath, callMarker) : basePath;
  html = indent`
    <debug-link href="${path}">
      ${html}
    </debug-link>
  `;

  if (call) {
    contexts += contextHtml(call, path);
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
  const path = call ? joinPath(inputPath, callMarker) : inputPath;

  const html = indent`
    <debug-link href="${path}">
      ${escaped}
    </debug-link>
  `;

  const contexts = call ? contextHtml(call, path) : "";

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
    if (
      input === null ||
      typeof input !== "object" ||
      input[traceSymbol] === undefined
    ) {
      return false;
    }

    // Ignore functions
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

function joinPath(basePath, key) {
  return `${trailingSlash.add(basePath)}${key}`;
}

export function resultDecomposition(result, trace = result[traceSymbol]) {
  const { call, code, inputs } = trace;
  const data = {
    result,
  };

  if (call) {
    data[callMarker] = resultDecomposition(result, call);
  }

  if (inputs[0] === ops.concat) {
    // Elide ops.concat from decomposition
    return resultDecomposition(inputs[1]);
  }

  const flags = inputFlags(code, inputs);
  const inputDecompositions = inputs
    .filter((input, index) => flags[index])
    .map((input) => resultDecomposition(input));

  Object.assign(data, inputDecompositions);

  return data;
}

export function traceHtml(result, basePath) {
  return contextHtml(result[traceSymbol], basePath);
}

/***************/

function formatCode(expression) {
  return escapeXml(expression);
}

async function formatResult(object) {
  if (object == null) {
    return object;
  } else if (isStringLike(object)) {
    const text = toString(object);
    const trimmed = text.length > 255 ? text.slice(0, 255) + "…" : text;
    return escapeXml(trimmed);
  } else if (isPrimitive(object)) {
    return object;
  } else if (object instanceof Number || object instanceof String) {
    return object.valueOf();
  } else if (Tree.isAsyncTree(object)) {
    return "…";
  } else if (isPlainObject(object)) {
    return object;
  } else if (object instanceof Array) {
    return "…";
  } else {
    return object;
  }
}

async function traceOutline(trace, expression, value, path, isCall = false) {
  const { code, inputs } = trace;

  // Special cases
  if (code[0] === ops.concat) {
    // Elide ops.concat from outline
    const arg = inputs[1];
    return traceOutline(arg[traceSymbol], expression, arg, path);
  }

  const formatted = await formatResult(value);
  const resultPath = joinPath(path, "result");
  const item = indent`
    ${isCall ? "<div>⋮</div>\n" : ""}
    <li>
      <a href="${resultPath}" target="resultPane">
        <code>${expression}</code>
        <span>${formatted}</span>
      </a>
    </li>
  `;

  const flags = inputFlags(code, inputs);
  const childPromises = inputs
    .filter((input, index) => flags[index])
    .map((input, index) => {
      const inputTrace = input[traceSymbol];
      const expression = formatCode(inputTrace.code.expression);
      const inputPath = joinPath(path, index);
      return traceOutline(inputTrace, expression, input, inputPath);
    });
  const children = await Promise.all(childPromises);

  if (trace.call) {
    children.shift();
    const fnChild = inputs[0];
    const fnTrace = fnChild[traceSymbol];
    const expression = fnTrace ? formatCode(fnTrace.expression) : "[unknown]";
    const callPath = joinPath(path, callMarker);
    const callOutline = await traceOutline(
      trace.call,
      expression,
      fnChild,
      callPath,
      true
    );
    children.push(callOutline);
  }

  const list =
    children.length > 0
      ? indent`
        <ul>
          ${children.join("")}
        </ul>
      `
      : "";

  return list ? [item, list].join("") : item;
}

export async function resultTrace(result, path) {
  const trace = result[traceSymbol];
  const expression = formatCode(trace.expression);
  const context = await traceOutline(trace, expression, result, path);
  return indent`
    <ul>
      ${context}
    </ul>
  `;
}
