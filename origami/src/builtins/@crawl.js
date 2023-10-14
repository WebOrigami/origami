import { Dictionary, Graph, ObjectGraph } from "@graphorigami/core";
import { extname } from "node:path";
import InvokeFunctionsTransform from "../common/InvokeFunctionsTransform.js";
import { isPlainObject } from "../common/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Crawl a graph, starting its root index.html page, and following links to
 * crawlable pages, scripts, and stylesheets.
 *
 * Returns a new graph of the crawled content. The crawled content will be
 * in-memory. Referenced resources like images will be represented as functions
 * that obtain the requested value from the original site.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} graphable
 * @param {string} [baseHref]
 * @returns {Promise<AsyncDictionary>}
 */
export default async function crawl(graphable, baseHref) {
  assertScopeIsDefined(this);
  const graph = Graph.from(graphable);

  if (baseHref === undefined) {
    // Ask graph or original graphable if it has an `href` property we can use as
    // the base href to determine whether a link is local within the graph or
    // not. If not, use a fake `local:/` href.
    baseHref =
      /** @type {any} */ (graph).href ??
      /** @type {any} */ (graphable).href ??
      "local:/";
    if (!baseHref?.endsWith("/")) {
      baseHref += "/";
    }
  }
  // @ts-ignore
  const baseUrl = new URL(baseHref);

  const cache = {};

  // We iterate until there are no more promises to wait for.
  for await (const result of crawlPaths(graph, baseUrl)) {
    const { keys, resourcePaths, value } = result;

    // Cache the value
    if (value) {
      addValueToObject(cache, keys, value);
    }

    // Add indirect resource references to the cache.
    for (const resourcePath of resourcePaths) {
      const fn = () => {
        return Graph.traversePath(graph, resourcePath);
      };
      const resourceKeys = Graph.keysFromPath(resourcePath);
      addValueToObject(cache, resourceKeys, fn);
    }
  }

  const result = new (InheritScopeTransform(
    InvokeFunctionsTransform(ObjectGraph)
  ))(cache);
  result.parent = this;
  return result;
}

function addValueToObject(object, keys, value) {
  for (let i = 0, current = object; i < keys.length; i++) {
    const key = keys[i];
    if (i === keys.length - 1) {
      // Write out value
      if (isPlainObject(current[key])) {
        // Route with existing values; treat the new value as an index.html
        current[key]["index.html"] = value;
      } else {
        current[key] = value;
      }
    } else {
      // Traverse further
      if (!current[key]) {
        current[key] = {};
      } else if (!isPlainObject(current[key])) {
        // Already have a value at this point. The site has a page
        // at a route like /foo, and the site also has resources
        // within that at routes like /foo/bar.jpg. We move the
        // current value to "index.html".
        current[key] = { "index.html": current[key] };
      }
      current = current[key];
    }
  }
}

// Crawl the paths for the given graph, starting at the given base URL, and
// yield the results. The results will include the HTML/script/stylesheet value
// retrieved at a path, along with the paths to other resources found in that
// text.
async function* crawlPaths(graph, baseUrl) {
  // We want to kick off requests for new paths as quickly as we find them, then
  // yield whichever result finishes first. Unfortunately, Promise.any() only
  // tells us the result of the first promise to resolve, not which promise that
  // was. So we keep track of a dictionary mapping paths to a promise for the
  // value at that path. When a promise resolves, we mark it as resolved by
  // setting its entry in the dictionary to null.
  const promisesForPaths = {};

  // Seed the promise dictionary with robots.txt and an empty path that will be
  // equivalent to the base URL.
  const initialPaths = ["/robots.txt", ""];
  initialPaths.forEach((path) => {
    promisesForPaths[path] = processPath(graph, path, baseUrl);
  });

  while (true) {
    // Get the latest array of promises that haven't been resolved yet.
    const promises = Object.values(promisesForPaths).filter(
      (promise) => promise !== null
    );

    if (promises.length === 0) {
      // No unresolved promises; we're done.
      break;
    }

    // Wait for the first promise to resolve.
    const result = await Promise.any(promises);

    // Mark the promise for that result as resolved.
    promisesForPaths[result.path] = null;

    // Add promises for crawlable paths in the result.
    result.crawlablePaths.forEach((path) => {
      // Only add a promise for this path if we don't already have one.
      if (promisesForPaths[path] === undefined) {
        promisesForPaths[path] = processPath(graph, path, baseUrl);
      }
    });

    yield result;
  }
}

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
      return url.pathname.slice(basePathname.length);
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

function findPaths(value, key, baseUrl, localPath) {
  // We guess the value is HTML is if its key has an .html extension or
  // doesn't have an extension, or the value starts with `<`.
  const ext = key ? extname(key) : "";
  const maybeHtml = ext === "" || value.trim?.().startsWith("<");
  let foundPaths;
  if (ext === ".html" || ext === ".htm") {
    foundPaths = findPathsInHtml(String(value));
  } else if (ext === ".css") {
    foundPaths = findPathsInCss(String(value));
  } else if (ext === ".js") {
    foundPaths = findPathsInJs(String(value));
  } else if (ext === ".map") {
    foundPaths = findPathsInImageMap(String(value));
  } else if (key === "robots.txt") {
    foundPaths = findPathsInRobotsTxt(String(value));
  } else if (key === "sitemap.xml") {
    foundPaths = findPathsInSitemapXml(String(value));
  } else if (maybeHtml) {
    foundPaths = findPathsInHtml(String(value));
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
  const urlRegex = /url\(["']?(?<url>[^"')]*?)["']?\)/g;
  while ((match = urlRegex.exec(css))) {
    resourcePaths.push(match.groups?.url);
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
    resourcePaths.push(match.groups?.href);
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
    crawlablePaths.push(match.groups?.import);
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
    /<(?:a|A|link|LINK) [^>]*?(?:href|HREF)=["'](?<link>[^>]*?)["'][^>]*>/g;
  while ((match = linkRegex.exec(html))) {
    // Links can point to be other crawlable paths and resource paths.
    // We guess the type based on the extension.
    const href = match.groups?.link;
    if (isCrawlableHref(href)) {
      crawlablePaths.push(href);
    } else {
      resourcePaths.push(href);
    }
  }

  // Find `src` attributes in img and script tags.
  const srcRegex =
    /<(?<tag>img|IMG|script|SCRIPT) [^>]*?(?:src|SRC)=["'](?<src>[^>]*?)["'][^>]*>/g;
  while ((match = srcRegex.exec(html))) {
    const tag = match.groups?.tag;
    if (tag === "script" || tag === "SCRIPT") {
      crawlablePaths.push(match.groups?.src);
    } else {
      resourcePaths.push(match.groups?.src);
    }
  }

  // Find `url()` functions in CSS.
  const urlRegex = /url\(["']?(?<url>[^"')]*?)["']?\)/g;
  while ((match = urlRegex.exec(html))) {
    resourcePaths.push(match.groups?.url);
  }

  // Find `src` attribute on frame tags.
  const frameRegex =
    /<(?:frame|FRAME) [^>]*?(?:src|SRC)=["'](?<frame>[^>]*?)["'][^>]*>/g;
  while ((match = frameRegex.exec(html))) {
    crawlablePaths.push(match.groups?.frame);
  }

  // Find ancient `background` attribute on body tag.
  const backgroundRegex =
    /<(?:body|BODY) [^>]*?(?:background|BACKGROUND)=["'](?<background>[^>]*?)["'][^>]*>/g;
  while ((match = backgroundRegex.exec(html))) {
    resourcePaths.push(match.groups?.background);
  }

  // Find `href` attribute on area tags.
  const areaRegex =
    /<(?:area|AREA) [^>]*?(?:href|HREF)=["'](?<href>[^>]*?)["'][^>]*>/g;
  while ((match = areaRegex.exec(html))) {
    crawlablePaths.push(match.groups?.href);
  }

  return { crawlablePaths, resourcePaths };
}

function findPathsInRobotsTxt(txt) {
  const crawlablePaths = [];
  let match;

  // Find `Sitemap` directives.
  const sitemapRegex = /Sitemap:\s*(?<sitemap>[^\s]*)/g;
  while ((match = sitemapRegex.exec(txt))) {
    crawlablePaths.push(match.groups?.sitemap);
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
  const locRegex = /<loc>(?<loc>[^<]*)<\/loc>/g;
  while ((match = locRegex.exec(xml))) {
    crawlablePaths.push(match.groups?.loc);
  }

  return {
    crawlablePaths,
    resourcePaths: [],
  };
}

function isCrawlableHref(href) {
  // Use a fake base URL to cover the case where the href is relative.
  const url = new URL(href, "fake://");
  const pathname = url.pathname;
  const lastKey = pathname.split("/").pop() ?? "";
  if (lastKey === "robots.txt" || lastKey === "sitemap.xml") {
    return true;
  }
  const ext = extname(lastKey);
  // We assume an empty extension is HTML.
  const crawlableExtensions = [".html", ".css", ".js", ".map", ""];
  return crawlableExtensions.includes(ext);
}

async function processPath(graph, path, baseUrl) {
  if (path === undefined) {
    return {
      crawlablePaths: [],
      keys: null,
      path,
      resourcePaths: [],
      value: null,
    };
  }

  // Convert path to keys
  /** @type {any[]} */
  let keys = Graph.keysFromPath(path);

  // Traverse graph to get value.
  let value = await Graph.traverse(graph, ...keys);
  if (Dictionary.isAsyncDictionary(value)) {
    // Path is actually a directory; see if it has an index.html
    if (keys.at(-1) === Graph.defaultValueKey) {
      keys.pop();
    }
    keys.push("index.html");
    value = await Graph.traverse(value, "index.html");
  }

  if (value === undefined) {
    return { crawlablePaths: [], keys, path, resourcePaths: [], value: null };
  }

  if (keys.at(-1) === Graph.defaultValueKey) {
    // For indexing and storage purposes, treat a path that ends in a trailing
    // slash (or the dot we use to seed the queue) as if it ends in
    // index.html.
    keys[keys.length - 1] = "index.html";
  }

  // Find paths in the value
  const key = keys.at(-1);
  const { crawlablePaths, resourcePaths } = await findPaths(
    value,
    key,
    baseUrl,
    path
  );

  return { crawlablePaths, keys, path, resourcePaths, value };
}

crawl.usage = `@crawl <graph>\tCrawl a graph`;
crawl.documentation = "https://graphorigami.org/language/@crawl.html";
