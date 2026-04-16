import { systemCache } from "@weborigami/language";

export default function cache() {
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
  return new Map(entries);
}
