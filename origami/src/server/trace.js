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

// Escape XML entities for in the text.
function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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
    const callExpression =
      fnChild === ops.scope
        ? code.expression
        : fnTrace
        ? formatCode(fnTrace.expression)
        : "[unknown]";
    const callValue = fnChild === ops.scope ? trace.call.expression : fnChild;
    const callPath = joinPath(path, callMarker);
    const callOutline = await traceOutline(
      trace.call,
      callExpression,
      callValue,
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
