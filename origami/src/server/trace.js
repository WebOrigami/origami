/* Generate trace links and results for debugger */

import { isStringLike, toString } from "@weborigami/async-tree";
import { symbols } from "@weborigami/language";
const { codeSymbol, inputsSymbol } = symbols;

export function traceLinks(result, basePath = "") {
  const code = result[codeSymbol];
  const text = code.location.source.text;

  // Construct link data for this level of the result
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
  const inputLinks = result[inputsSymbol]
    .filter(
      (input) => typeof input === "object" && input[inputsSymbol] !== undefined
    )
    .map((input, index) => traceLinks(input, `${basePath}/${index}`));

  return {
    value: fragments,
    ...inputLinks,
  };
}

export function resultDecomposition(result) {
  const inputs = result[inputsSymbol]
    .filter(
      (input) => typeof input === "object" && input[inputsSymbol] !== undefined
    )
    .map(resultDecomposition);
  return {
    value: result,
    ...inputs,
  };
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
