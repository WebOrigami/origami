import { isPlainObject } from "@weborigami/async-tree";

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
