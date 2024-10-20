import { toString } from "@weborigami/async-tree";
import { extname } from "@weborigami/language";
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
  const ext = key ? extname(key).toLowerCase() : "";
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
      resourcePaths.push();
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
  let match;

  // Find `href` attributes in anchor and link tags.
  const linkRegex =
    /<(?:a|A|link|LINK)[\s][^>]*?(?:href|HREF)=["'](?<link>[^>]*?)["'][^>]*>/g;
  while ((match = linkRegex.exec(html))) {
    // Links can point to be other crawlable paths and resource paths.
    // We guess the type based on the extension.
    const href = normalizeHref(match.groups?.link);
    if (href) {
      if (isCrawlableHref(href)) {
        crawlablePaths.push(href);
      } else {
        resourcePaths.push(href);
      }
    }
  }

  // Find `src` attributes in img and script tags.
  const srcRegex =
    /<(?<tag>img|IMG|script|SCRIPT)[\s][^>]*?(?:src|SRC)=["'](?<src>[^>]*?)["'][^>]*>/g;
  while ((match = srcRegex.exec(html))) {
    const tag = match.groups?.tag;
    const src = normalizeHref(match.groups?.src);
    if (src) {
      if (tag === "script" || tag === "SCRIPT") {
        crawlablePaths.push(src);
      } else {
        resourcePaths.push(src);
      }
    }
  }

  // Find `url()` functions in CSS.
  const urlRegex = /url\(["']?(?<href>[^"')]*?)["']?\)/g;
  while ((match = urlRegex.exec(html))) {
    const href = normalizeHref(match.groups?.href);
    if (href) {
      resourcePaths.push(href);
    }
  }

  // Find `src` attribute on frame tags.
  const frameRegex =
    /<(?:frame|FRAME)[\s][^>]*?(?:src|SRC)=["'](?<href>[^>]*?)["'][^>]*>/g;
  while ((match = frameRegex.exec(html))) {
    const href = normalizeHref(match.groups?.href);
    if (href) {
      crawlablePaths.push(href);
    }
  }

  // Find ancient `background` attribute on body tag.
  const backgroundRegex =
    /<(?:body|BODY)[\s][^>]*?(?:background|BACKGROUND)=["'](?<href>[^>]*?)["'][^>]*>/g;
  while ((match = backgroundRegex.exec(html))) {
    const href = normalizeHref(match.groups?.href);
    if (href) {
      resourcePaths.push(href);
    }
  }

  // Find `href` attribute on area tags.
  const areaRegex =
    /<(?:area|AREA)[\s][^>]*?(?:href|HREF)=["'](?<href>[^>]*?)["'][^>]*>/g;
  while ((match = areaRegex.exec(html))) {
    const href = normalizeHref(match.groups?.href);
    if (href) {
      crawlablePaths.push(href);
    }
  }

  // Also look for JS `import` statements that might be in <script type="module"> tags.
  const jsResults = findPathsInJs(html);
  crawlablePaths.push(...jsResults.crawlablePaths);

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
