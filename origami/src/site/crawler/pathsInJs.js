import { normalizeHref } from "./utilities.js";

export default function pathsInJs(js) {
  const crawlablePaths = [];
  let match;

  // Find `import` statements.
  const importRegex = /import [\s\S]+?from\s+["'](?<import>[^"']*)["'];/g;
  while ((match = importRegex.exec(js))) {
    const href = normalizeHref(match.groups?.import);
    if (href) {
      crawlablePaths.push(href);
    }
  }

  return {
    crawlablePaths,
    resourcePaths: [],
  };
}
