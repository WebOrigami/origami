import { activeProjectRoot, systemCache, volatile } from "@weborigami/language";
import path from "node:path";
import * as YAMLModule from "yaml";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

export default function syscache() {
  const projectRoot = activeProjectRoot.get();

  /** @type {any} */
  const entries = [...systemCache.entries()].map(([path, entry]) => {
    const result = {};
    if (entry.downstreams) {
      result.downstreams = preferRelativePaths(projectRoot, entry.downstreams);
      result.downstreams.sort((a, b) => a.localeCompare(b));
    }
    if (entry.upstreams) {
      result.upstreams = preferRelativePaths(projectRoot, entry.upstreams);
      result.upstreams.sort((a, b) => a.localeCompare(b));
    }
    return [preferRelativePath(projectRoot, path), result];
  });

  // Sort the entries by key
  entries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  const result = volatile(new Map(entries));

  // When served, render as YAML and preserve trailing slashes
  Object.defineProperty(result, "pack", {
    configurable: true,
    enumerable: false,
    get() {
      return () => volatile(YAML.stringify(result));
    },
  });

  return result;
}

function preferRelativePath(projectRoot, inputPath) {
  if (!path.isAbsolute(inputPath)) {
    return inputPath;
  }
  const prefix = `${projectRoot.path}${path.sep}`;
  if (!inputPath.startsWith(prefix)) {
    return inputPath;
  }
  const relativePath = inputPath.slice(prefix.length);
  return relativePath;
}

function preferRelativePaths(projectRoot, paths) {
  return Array.from(paths).map((path) => preferRelativePath(projectRoot, path));
}
