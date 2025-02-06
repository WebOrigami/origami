import { box, isStringLike, scope, toString } from "@weborigami/async-tree";
import codeFragment from "./codeFragment.js";
import {
  codeSymbol,
  expressionSymbol,
  inputsSymbol,
  scopeSymbol,
  traceSymbol,
} from "./symbols.js";

export default function addTrace(context, code, inputs, result) {
  if (typeof result === "symbol") {
    return result;
  }

  if (result) {
    result = box(result);
    try {
      if (!(expressionSymbol in result)) {
        Object.defineProperty(result, expressionSymbol, {
          get() {
            return code.location ? codeFragment(code.location) : null;
          },
          enumerable: false,
        });
      }
      if (!(codeSymbol in result)) {
        Object.defineProperty(result, codeSymbol, {
          value: code,
          enumerable: false,
        });
      }
      if (!(inputsSymbol in result)) {
        Object.defineProperty(result, inputsSymbol, {
          value: inputs,
          enumerable: false,
        });
      }
      if (!(scopeSymbol in result)) {
        Object.defineProperty(result, scopeSymbol, {
          get() {
            return scope(context).trees;
          },
          enumerable: false,
        });
      }
      if (!(traceSymbol in result)) {
        Object.defineProperty(result, traceSymbol, {
          get() {
            return createTrace(result, true, "");
          },
          enumerable: false,
        });
      }
    } catch (/** @type {any} */ error) {
      // Ignore errors.
    }
  }

  return result;
}

function collectSourceFragments(code, basePath) {
  const text = code.location.source.text;

  const spans = code
    .filter((entry) => entry instanceof Array)
    .map((entry, index) => ({
      end: entry.location.end.offset,
      index,
      start: entry.location.start.offset,
    }));
  spans.sort((a, b) => a.start - b.start);

  const fragments = [];
  let i = code.location.start.offset;
  for (const { end, index, start } of spans) {
    if (i < start) {
      fragments.push({
        text: text.slice(i, start),
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
  return fragments;
}

function createTrace(result, includeSource, basePath) {
  const resultJsonValue = format(result);

  const code = result[codeSymbol];
  let source;
  if (includeSource) {
    const fragments = collectSourceFragments(code, basePath);
    source = {
      fragments,
    };
  }

  const location = code.location;
  const sourceText = location.source.text;

  let inputTraces;
  const inputs = result[inputsSymbol];
  if (inputs) {
    inputs.shift();
    inputTraces = inputs
      .filter((input) => typeof input === "object")
      .map((input, index) => {
        const inputCode = input[codeSymbol];
        const inputLocation = inputCode.location;
        const inputSourceText = inputLocation.source.text;
        const sourceDiffers =
          inputSourceText !== sourceText ||
          inputLocation.start.offset < location.start.offset ||
          inputLocation.start.offset > location.end.offset ||
          inputLocation.end.offset < location.start.offset ||
          inputLocation.end.offset > location.end.offset;
        const path = `${basePath}/${index}`;
        return createTrace(input, sourceDiffers, path);
      });
  }

  return Object.assign(
    {
      result: resultJsonValue,
    },
    source && { source },
    inputTraces.length > 0 && { inputs: inputTraces }
  );
}

function format(object) {
  if (typeof object === "number") {
    return object;
  } else if (object instanceof Number || object instanceof String) {
    return object.valueOf();
  } else if (isStringLike(object)) {
    return toString(object);
  } else if (object instanceof Function) {
    return Object.getOwnPropertyNames(object).includes("toString")
      ? object.toString()
      : object.name;
  } else {
    return object;
  }
}
