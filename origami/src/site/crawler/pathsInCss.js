import { isCrawlableHref, normalizeHref } from "./utilities.js";

export default function findPathsInCss(css) {
  const crawlablePaths = [];
  const resourcePaths = [];
  let match;

  // Find `url()` functions.
  const urlRegex = /url\(["']?(?<href>[^"')]*?)["']?\)/g;
  while ((match = urlRegex.exec(css))) {
    const href = normalizeHref(match.groups?.href);
    if (href) {
      if (isCrawlableHref(href)) {
        crawlablePaths.push(href);
      } else {
        resourcePaths.push(href);
      }
    }
  }

  return {
    crawlablePaths,
    resourcePaths,
  };
}
