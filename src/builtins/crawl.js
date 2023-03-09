import { extname } from "node:path";
import InvokeFunctionsTransform from "../common/InvokeFunctionsTransform.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ObjectGraph from "../core/ObjectGraph.js";
import { isPlainObject, keysFromPath } from "../core/utilities.js";

/**
 * Crawl a graph, starting its root index.html page, and following links to
 * other pages and resources. Return a new graph of the crawled content.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 * @param {string} [baseHref]
 * @returns {Promise<Explorable>}
 */
export default async function crawl(variant, baseHref) {
  const graph = ExplorableGraph.from(variant);

  if (baseHref === undefined) {
    // Ask graph or original variant if it has an `href` property we can use as
    // the base href to determine whether a link is local within the graph or
    // not. If not, use a fake `local:/` href.
    baseHref =
      /** @type {any} */ (graph).href ??
      /** @type {any} */ (variant).href ??
      "local:/";
    if (!baseHref?.endsWith("/")) {
      baseHref += "/";
    }
  }
  // @ts-ignore
  const baseUrl = new URL(baseHref);

  const cache = {};
  const pathQueue = ["/robots.txt", "/"];
  const seenPaths = new Set();

  while (pathQueue.length > 0) {
    const path = pathQueue.shift();
    if (!path) {
      continue;
    }

    // Based on the extension, do we want to get the value?
    const keys = keysFromPath(path);
    if (!isKeyForCrawlableFile(keys.at(-1))) {
      // Don't get the value now. Add a function to the cache that will retrieve
      // the value when needed.
      const fn = async () => {
        return ExplorableGraph.traverse(graph, ...keys);
      };
      addValueToObject(cache, keys, fn);
      continue;
    }

    // Get value at path
    let value = await ExplorableGraph.traverse(graph, ...keys);
    if (ExplorableGraph.isExplorable(value)) {
      // Path is actually a directory; see if it has an index.html
      if (keys.at(-1) === undefined) {
        keys.pop();
      }
      keys.push("index.html");
      value = await ExplorableGraph.traverse(value, "index.html");
    }

    if (value === undefined) {
      continue;
    }

    if (keys.at(-1) === undefined) {
      // For indexing and storage purposes, treat a path that ends in a
      // trailing slash as if it ends in index.html.
      keys[keys.length - 1] = "index.html";
    }

    // Cache the value
    addValueToObject(cache, keys, value);

    // Find paths in the value
    const key = keys.at(-1);
    const paths = await findPaths(value, key, baseUrl, path);

    // Add new paths to the queue.
    const newPaths = new Set(paths.filter((path) => !seenPaths.has(path)));
    pathQueue.push(...newPaths);
    newPaths.forEach((path) => seenPaths.add(path));
  }

  const result = new (InvokeFunctionsTransform(ObjectGraph))(cache);
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

function findPaths(value, key, baseUrl, localPath) {
  // We guess the value is HTML is if its key has an .html extension or
  // doesn't have an extension, or the value starts with `<`.
  const ext = key ? extname(key) : "";
  const maybeHtml = ext === "" || value.trim?.().startsWith("<");
  let foundPaths;
  if (ext === ".html") {
    foundPaths = findPathsInHtml(String(value));
  } else if (ext === ".css") {
    foundPaths = findPathsInCss(String(value));
  } else if (ext === ".js") {
    foundPaths = findPathsInJs(String(value));
  } else if (key === "robots.txt") {
    foundPaths = findPathsInRobotsTxt(String(value));
  } else if (key === "sitemap.xml") {
    foundPaths = findPathsInSitemapXml(String(value));
  } else if (maybeHtml) {
    foundPaths = findPathsInHtml(String(value));
  } else {
    // Doesn't have an extension we want to process
    return [];
  }

  // Convert paths to absolute URLs.
  const localUrl = new URL(localPath, baseUrl);
  const basePathname = baseUrl.pathname;
  // @ts-ignore
  const absoluteUrls = foundPaths.map((path) => new URL(path, localUrl));

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
  const paths = relativePaths.filter((path) => path !== null);
  return paths;
}

function findPathsInCss(css) {
  const paths = [];
  let match;

  // Find `url()` functions.
  const urlRegex = /url\(["']?(?<url>[^"')]*?)["']?\)/g;
  while ((match = urlRegex.exec(css))) {
    paths.push(match.groups?.url);
  }

  return paths;
}

function findPathsInJs(js) {
  const paths = [];
  let match;

  // Find `import` statements.
  const importRegex = /import [\s\S]+?from\s+["'](?<import>[^"']*)["'];/g;
  while ((match = importRegex.exec(js))) {
    paths.push(match.groups?.import);
  }

  return paths;
}

function findPathsInHtml(html) {
  const paths = [];
  let match;

  // Find `href` attributes in anchor and link tags.
  const linkRegex = /<(?:a|link) [^>]*?href=["'](?<link>[^>]*?)["'][^>]*>/g;
  while ((match = linkRegex.exec(html))) {
    paths.push(match.groups?.link);
  }

  // Find `src` attributes in img and script tags.
  const srcRegex = /<(?:img|script) [^>]*?src=["'](?<src>[^>]*?)["'][^>]*>/g;
  while ((match = srcRegex.exec(html))) {
    paths.push(match.groups?.src);
  }

  // Find `url()` functions in CSS.
  const urlRegex = /url\(["']?(?<url>[^"')]*?)["']?\)/g;
  while ((match = urlRegex.exec(html))) {
    paths.push(match.groups?.url);
  }

  return paths;
}

function findPathsInRobotsTxt(txt) {
  const paths = [];
  let match;

  // Find `Sitemap` directives.
  const sitemapRegex = /Sitemap:\s*(?<sitemap>[^\s]*)/g;
  while ((match = sitemapRegex.exec(txt))) {
    paths.push(match.groups?.sitemap);
  }

  return paths;
}

function findPathsInSitemapXml(xml) {
  const paths = [];
  let match;

  // Find `loc` elements.
  const locRegex = /<loc>(?<loc>[^<]*)<\/loc>/g;
  while ((match = locRegex.exec(xml))) {
    paths.push(match.groups?.loc);
  }

  return paths;
}

function isKeyForCrawlableFile(key) {
  // Undefined key is tantamount to "index.html"
  if (key === undefined || key === "robots.txt" || key === "sitemap.xml") {
    return true;
  }
  const ext = extname(key);
  const crawlableExtensions = [".html", ".css", ".js", ""];
  return crawlableExtensions.includes(ext);
}

crawl.usage = `crawl <graph>\tCrawl a graph`;
crawl.documentation = "https://graphorigami.org/cli/builtins.html#crawl";
