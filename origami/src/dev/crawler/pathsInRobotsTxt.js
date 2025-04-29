import { normalizeHref } from "./utilities.js";

export default function pathsInRobotsTxt(txt) {
  const crawlablePaths = [];
  let match;

  // Find `Sitemap` directives.
  const sitemapRegex = /Sitemap:\s*(?<href>[^\s]*)/g;
  while ((match = sitemapRegex.exec(txt))) {
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
