import { normalizeHref } from "./utilities.js";

// These are ancient server-side image maps. They're so old that it's hard to
// find documentation on them, but they're used on the reference Space Jam
// website we use for testing the crawler.
//
// Example: https://www.spacejam.com/1996/bin/bball.map
export default function pathsInImageMap(imageMap) {
  const resourcePaths = [];
  let match;

  // Find hrefs as the second column in each line.
  const hrefRegex = /^\w+ (?<href>\S+)(\s*$| [\d, ]+$)/gm;
  while ((match = hrefRegex.exec(imageMap))) {
    const href = normalizeHref(match.groups?.href);
    if (href) {
      resourcePaths.push(href);
    }
  }

  return {
    crawlablePaths: [],
    resourcePaths,
  };
}
