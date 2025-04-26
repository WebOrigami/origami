import { extension, toString } from "@weborigami/async-tree";
import htmlDom from "../../text/htmlDom.js";
import { isCrawlableHref, normalizeHref } from "./utilities.js";

// Filter the paths to those that are local to the site.
function filterPaths(paths, baseUrl, localPath) {
  // Convert paths to absolute URLs.
  const localUrl = new URL(localPath, baseUrl);
  const basePathname = baseUrl.pathname;
  // @ts-ignore
  const absoluteUrls = paths.map((path) => new URL(path, localUrl));

  // Convert the absolute URLs to paths relative to the baseHref. If the URL
  // points outside the tree rooted at the baseHref, the relative path will be
  // null. We ignore the protocol in this test, because in practice sites often
  // fumble the use of http and https, treating them interchangeably.
  const relativePaths = absoluteUrls.map((url) => {
    if (url.host === baseUrl.host && url.pathname.startsWith(basePathname)) {
      const path = url.pathname.slice(basePathname.length);
      // The process of creating the URLs will have escaped characters. We
      // remove them. This has the side-effect of removing them if they existed
      // in the original path; it would be better if we avoided that.
      return decodeURIComponent(path);
    } else {
      return null;
    }
  });

  // Filter out the null paths.
  /** @type {string[]} */
  // @ts-ignore
  const filteredPaths = relativePaths.filter((path) => path);
  return filteredPaths;
}

/**
 * Given a value retrieved from a site using a given key (name), determine what
 * kind of file it is and, based on that, find the paths it references.
 */
export default function findPaths(value, key, baseUrl, localPath) {
  const text = toString(value);

  // We guess the value is HTML is if its key has an .html extension or
  // doesn't have an extension, or the value starts with `<`.
  const ext = key ? extension.extname(key).toLowerCase() : "";
  let foundPaths;
  if (ext === ".html" || ext === ".htm" || ext === ".xhtml") {
    foundPaths = findPathsInHtml(text);
  } else if (ext === ".css") {
    foundPaths = findPathsInCss(text);
  } else if (ext === ".js") {
    foundPaths = findPathsInJs(text);
  } else if (ext === ".map") {
    foundPaths = findPathsInImageMap(text);
  } else if (key === "robots.txt") {
    foundPaths = findPathsInRobotsTxt(text);
  } else if (key === "sitemap.xml") {
    foundPaths = findPathsInSitemapXml(text);
  } else if (ext === "" && text?.trim().startsWith("<")) {
    // Probably HTML
    foundPaths = findPathsInHtml(text);
  } else {
    // Doesn't have an extension we want to process
    return {
      crawlablePaths: [],
      resourcePaths: [],
    };
  }

  const crawlablePaths = filterPaths(
    foundPaths.crawlablePaths,
    baseUrl,
    localPath
  );

  const resourcePaths = filterPaths(
    foundPaths.resourcePaths,
    baseUrl,
    localPath
  );

  return {
    crawlablePaths,
    resourcePaths,
  };
}

function findPathsInCss(css) {
  const resourcePaths = [];
  let match;

  // Find `url()` functions.
  const urlRegex = /url\(["']?(?<href>[^"')]*?)["']?\)/g;
  while ((match = urlRegex.exec(css))) {
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

// These are ancient server-side image maps. They're so old that it's hard to
// find documentation on them, but they're used on the reference Space Jam
// website we use for testing the crawler. Example:
// https://www.spacejam.com/1996/bin/bball.map
function findPathsInImageMap(imageMap) {
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

function findPathsInJs(js) {
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

function findPathsInHtml(html) {
  const crawlablePaths = [];
  const resourcePaths = [];

  const dom = htmlDom(html);

  // Find `href` attributes in anchor, area, and link tags.
  const hrefTags = dom.querySelectorAll("a[href], area[href], link[href]");
  for (const hrefTag of hrefTags) {
    const href = normalizeHref(hrefTag.getAttribute("href"));
    if (href) {
      if (isCrawlableHref(href)) {
        crawlablePaths.push(href);
      } else {
        resourcePaths.push(href);
      }
    }
  }

  // Find `src` attributes in frame, img, and script tags.
  const srcTags = dom.querySelectorAll("frame[src], img[src], script[src]");
  for (const srcTag of srcTags) {
    const src = normalizeHref(srcTag.getAttribute("src"));
    if (src) {
      if (srcTag.tagName === "FRAME" || srcTag.tagName === "SCRIPT") {
        crawlablePaths.push(src);
      } else {
        resourcePaths.push(src);
      }
    }
  }

  // Find paths in CSS in <style> tags.
  const styleTags = dom.querySelectorAll("style");
  for (const styleTag of styleTags) {
    const css = styleTag.textContent;
    const cssResults = findPathsInCss(css);
    crawlablePaths.push(...cssResults.crawlablePaths);
    resourcePaths.push(...cssResults.resourcePaths);
  }

  // Find ancient `background` attribute on body tag.
  const body = dom.querySelector("body[background]");
  if (body) {
    const href = normalizeHref(body.getAttribute("background"));
    if (href) {
      resourcePaths.push(href);
    }
  }

  // Also look for JS `import` statements that might be in <script type="module"> tags.
  const scriptTags = dom.querySelectorAll("script[type='module']");
  for (const scriptTag of scriptTags) {
    const jsResults = findPathsInJs(scriptTag.textContent);
    crawlablePaths.push(...jsResults.crawlablePaths);
  }

  return { crawlablePaths, resourcePaths };
}

function findPathsInRobotsTxt(txt) {
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

function findPathsInSitemapXml(xml) {
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
