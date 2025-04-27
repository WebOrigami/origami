import { addHref } from "./utilities.js";

export default function pathsInJs(js) {
  const paths = {
    crawlablePaths: [],
    resourcePaths: [],
  };

  let match;

  // Find `import` statements.
  const importRegex = /import [\s\S]+?from\s+["'](?<import>[^"']*)["'];/g;
  while ((match = importRegex.exec(js))) {
    addHref(paths, match.groups?.import, true);
  }

  return paths;
}
