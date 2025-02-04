import { isPlainObject } from "@weborigami/async-tree";
import assert from "node:assert";

export function assertCodeEqual(actual, expected) {
  const actualStripped = stripCodeLocations(actual);
  const expectedStripped = stripCodeLocations(expected);
  assert.deepEqual(actualStripped, expectedStripped);
}

/**
 * Adds a fake source to code.
 *
 * @returns {import("../../index.ts").AnnotatedCode}
 */
export function createCode(array) {
  const code = array;
  /** @type {any} */ (code).location = {
    end: 0,
    source: {
      text: "",
    },
    start: 0,
  };
  return code;
}

// For comparison purposes, strip the `location` property added by the parser.
export function stripCodeLocations(parseResult) {
  if (Array.isArray(parseResult)) {
    return parseResult.map(stripCodeLocations);
  } else if (isPlainObject(parseResult)) {
    const result = {};
    for (const key in parseResult) {
      if (key !== "location") {
        result[key] = stripCodeLocations(parseResult[key]);
      }
    }
    return result;
  } else {
    return parseResult;
  }
}
