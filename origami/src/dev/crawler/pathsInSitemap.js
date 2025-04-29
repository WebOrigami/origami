import { normalizeHref } from "./utilities.js";

export default function pathsInSitemap(xml) {
  const crawlablePaths = [];
  let match;

  // Find `loc` elements.
  const locRegex = /<loc>(?<href>[^<]*)<\/loc>/g;
  while ((match = locRegex.exec(xml))) {
    const href = normalizeHref(match.groups?.href);
    if (href) {
      crawlablePaths.push(href);
    }
  }

  return {
    crawlablePaths,
    resourcePaths: [],
  };
}
