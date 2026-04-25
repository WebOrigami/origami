import { systemCache } from "@weborigami/language";
import * as YAMLModule from "yaml";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

export default function syscache() {
  /** @type {any} */
  const entries = [...systemCache.entries()].map(([path, entry]) => {
    const result = {};
    if (entry.downstreams) {
      result.downstreams = entry.downstreams;
    }
    if (entry.upstreams) {
      result.upstreams = entry.upstreams;
    }
    return [path, result];
  });

  // Sort the entries by key
  entries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  const result = new Map(entries);

  // When served, render as YAML and preserve trailing slashes
  Object.defineProperty(result, "pack", {
    configurable: true,
    enumerable: false,
    get() {
      return () => YAML.stringify(result);
    },
  });

  return result;
}
