/* Format trace links and results for debugger */

import {
  isPlainObject,
  isPrimitive,
  isStringLike,
  toString,
  trailingSlash,
  Tree,
} from "@weborigami/async-tree";
import { taggedTemplateIndent as indent, ops } from "@weborigami/language";

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
  return expression;
}

async function formatResult(object) {
  if (object == null) {
    return object;
  } else if (isStringLike(object)) {
    const text = toString(object);
    const trimmed = text.length > 255 ? text.slice(0, 255) + "…" : text;
    return trimmed;
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
function inputFlags(inputs) {
  return inputs.map((input, index) => {
    const { code, result } = input;

    // Ignore functions
    if (typeof result === "function") {
      return false;
    }

    const fn = code[0];

    // ops.literal: ignore
    if (fn === ops.literal) {
      return false;
    }

    // Template literals: ignore template strings argument
    if (fn === ops.template || (fn === ops.builtin && code[1] === "indent")) {
      return index !== 1;
    }

    return true;
  });
}

function joinPath(basePath, key) {
  return `${trailingSlash.add(basePath)}${key}`;
}

export function resultDecomposition(trace) {
  const { call, code, inputs, result } = trace;

  const fn = code?.[0];
  if (fn === ops.concat) {
    // Elide ops.concat from decomposition
    return resultDecomposition(inputs[1]);
  } else if (fn === ops.external) {
    // Elide ops.external from decomposition
    return resultDecomposition(trace.call);
  }

  const data = {
    result,
  };

  if (inputs) {
    const flags = inputFlags(inputs);
    const inputDecompositions = inputs
      .filter((input, index) => flags[index])
      .map((input) => resultDecomposition(input));
    Object.assign(data, inputDecompositions);
  }

  if (call) {
    data[callMarker] = resultDecomposition(call);
  }

  return data;
}

export async function traceHtml(trace, path) {
  const context = await traceOutline(trace, path);
  return indent`
    <ul>
      ${context}
    </ul>
  `;
}

async function traceOutline(trace, path, callExpression, callValue) {
  const { code, inputs, result } = trace;

  const expression = callExpression ?? formatCode(trace.expression);
  const value = callValue ?? result;

  // Special cases
  const fn = code?.[0];
  if (fn === ops.concat) {
    // Elide ops.concat from outline
    return traceOutline(inputs[1], path);
  } else if (fn === ops.external) {
    // Elide ops.external from outline
    return traceOutline(trace.call, path);
  }

  const formatted = await formatResult(value);
  const resultPath = joinPath(path, "result");
  const item = indent`
    ${callExpression !== undefined ? "<div>⋮</div>\n" : ""}
    <li>
      <a href="${resultPath}" target="resultPane">
        <code>${escapeXml(expression)}</code>
        <span>${escapeXml(formatted)}</span>
      </a>
    </li>
  `;

  const flags = inputFlags(inputs);
  const childPromises = inputs
    .filter((input, index) => flags[index])
    .map((input, index) => {
      const inputPath = joinPath(path, index);
      return traceOutline(input, inputPath);
    });
  const children = await Promise.all(childPromises);

  if (trace.call) {
    children.shift();
    const fnTrace = inputs[0];
    // const fn = fnTrace?.code?.[0];
    // const isScopeRef = fn === ops.scope || fn === ops.external;
    const callExpression = fnTrace ? formatCode(fnTrace.expression) : undefined;
    const callValue = fnTrace?.result;
    const callPath = joinPath(path, callMarker);
    const callOutline = await traceOutline(
      trace.call,
      callPath,
      callExpression,
      callValue
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
