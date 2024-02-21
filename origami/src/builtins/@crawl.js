import {
  ObjectTree,
  Tree,
  isPlainObject,
  keysFromPath,
  mergeDeep,
} from "@weborigami/async-tree";
import { InvokeFunctionsTransform, Scope, extname } from "@weborigami/language";
import * as utilities from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import treeHttps from "./@treeHttps.js";

// A fake base URL used to handle cases where an href is relative and must be
// treated relative to some base URL.
const fakeBaseUrl = new URL("https://fake");

/**
 * Crawl a tree, starting its root index.html page, and following links to
 * crawlable pages, scripts, and stylesheets.
 *
 * Returns a new tree of the crawled content. The crawled content will be
 * in-memory. Referenced resources like images will be represented as functions
 * that obtain the requested value from the original site.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike|string} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {string} [baseHref]
 * @returns {Promise<AsyncTree>}
 */
export default async function crawl(treelike, baseHref) {
  assertScopeIsDefined(this, "crawl");
  const tree =
    typeof treelike === "string"
      ? treeHttps.call(this, treelike)
      : Tree.from(treelike);

  if (baseHref === undefined) {
    // Ask tree or original treelike if it has an `href` property we can use as
    // the base href to determine whether a link is local within the tree or
    // not. If not, use a fake `local:/` href.
    baseHref =
      /** @type {any} */ (tree).href ??
      /** @type {any} */ (treelike).href ??
      "local:/";
    if (!baseHref?.endsWith("/")) {
      baseHref += "/";
    }
  }
  // @ts-ignore
  const baseUrl = new URL(baseHref);

  const cache = {};
  const resources = {};
  const errors = [];

  // We iterate until there are no more promises to wait for.
  for await (const result of crawlPaths(tree, baseUrl)) {
    const { keys, resourcePaths, value } = result;

    // Cache the value
    if (value) {
      addValueToObject(cache, keys, value);
    } else if (keys) {
      // A missing robots.txt isn't an error; anything else missing is.
      const path = keys.join("/");
      if (path !== "robots.txt") {
        errors.push(path);
      }
    }

    // Add indirect resource functions to the resource tree. When requested,
    // these functions will obtain the resource from the original site.
    for (const resourcePath of resourcePaths) {
      const resourceKeys = adjustKeys(keysFromPath(resourcePath));
      const fn = () => {
        return traverse(tree, ...resourceKeys);
      };
      addValueToObject(resources, resourceKeys, fn);
    }
  }

  if (errors.length) {
    addValueToObject(
      cache,
      ["crawl-errors.json"],
      JSON.stringify(errors, null, 2)
    );
  }

  // Merge the cache on top of the resources tree. If we have an actual value
  // for something already, that's better than a function that will get that
  // value.
  /** @type {AsyncTree} */
  let result = mergeDeep(
    new ObjectTree(cache),
    new (InvokeFunctionsTransform(ObjectTree))(resources)
  );
  result = Scope.treeWithScope(result, this);
  return result;
}

// For indexing and storage purposes, treat a path that ends in a trailing slash
// (or the dot we use to seed the queue) as if it ends in index.html.
function adjustKeys(keys) {
  const adjustedKeys = keys.slice();
  if (adjustedKeys.at(-1) === "") {
    adjustedKeys[adjustedKeys.length - 1] = "index.html";
  }
  return adjustedKeys;
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

// Crawl the paths for the given tree, starting at the given base URL, and
// yield the results. The results will include the HTML/script/stylesheet value
// retrieved at a path, along with the paths to other resources found in that
// text.
async function* crawlPaths(tree, baseUrl) {
  // We want to kick off requests for new paths as quickly as we find them, then
  // yield whichever result finishes first. Unfortunately, Promise.any() only
  // tells us the result of the first promise to resolve, not which promise that
  // was. So we keep track of a dictionary mapping paths to a promise for the
  // value at that path. When a promise resolves, we mark it as resolved by
  // setting its entry in the dictionary to null.
  const promisesForPaths = {};

  // Seed the promise dictionary with robots.txt and the root path.
  const initialPaths = ["/robots.txt", ""];
  initialPaths.forEach((path) => {
    promisesForPaths[path] = processPath(tree, path, baseUrl);
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
        promisesForPaths[path] = processPath(tree, path, baseUrl);
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
  const text = utilities.toString(value);

  // We guess the value is HTML is if its key has an .html extension or
  // doesn't have an extension, or the value starts with `<`.
  const ext = key ? extname(key).toLowerCase() : "";
  const maybeHtml = ext === "" || text?.trim().startsWith("<");
  let foundPaths;
  if (ext === ".html" || ext === ".htm") {
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
  } else if (maybeHtml) {
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
    /<(?:a|A|link|LINK) [^>]*?(?:href|HREF)=["'](?<link>[^>]*?)["'][^>]*>/g;
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
    /<(?<tag>img|IMG|script|SCRIPT) [^>]*?(?:src|SRC)=["'](?<src>[^>]*?)["'][^>]*>/g;
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
    /<(?:frame|FRAME) [^>]*?(?:src|SRC)=["'](?<href>[^>]*?)["'][^>]*>/g;
  while ((match = frameRegex.exec(html))) {
    const href = normalizeHref(match.groups?.href);
    if (href) {
      crawlablePaths.push(href);
    }
  }

  // Find ancient `background` attribute on body tag.
  const backgroundRegex =
    /<(?:body|BODY) [^>]*?(?:background|BACKGROUND)=["'](?<href>[^>]*?)["'][^>]*>/g;
  while ((match = backgroundRegex.exec(html))) {
    const href = normalizeHref(match.groups?.href);
    if (href) {
      resourcePaths.push(href);
    }
  }

  // Find `href` attribute on area tags.
  const areaRegex =
    /<(?:area|AREA) [^>]*?(?:href|HREF)=["'](?<href>[^>]*?)["'][^>]*>/g;
  while ((match = areaRegex.exec(html))) {
    const href = normalizeHref(match.groups?.href);
    if (href) {
      crawlablePaths.push(href);
    }
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

function isCrawlableHref(href) {
  // Use a fake base URL to cover the case where the href is relative.
  const url = new URL(href, fakeBaseUrl);
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

// Remove any search parameters or hash from the href. Preserve absolute or
// relative nature of URL. If the URL only has a search or hash, return null.
function normalizeHref(href) {
  // Remove everything after a `#` or `?` character.
  const normalized = href.split(/[?#]/)[0];
  return normalized === "" ? null : normalized;
}

async function processPath(tree, path, baseUrl) {
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
  let keys = path === "" ? [""] : keysFromPath(path);

  // Traverse tree to get value.
  let value = await traverse(tree, ...keys);
  if (Tree.isAsyncTree(value)) {
    // Path is actually a directory; see if it has an index.html
    value = await traverse(value, "index.html");
  }

  const adjustedKeys = adjustKeys(keys);

  if (value === undefined) {
    return {
      crawlablePaths: [],
      keys: adjustedKeys,
      path,
      resourcePaths: [],
      value: null,
    };
  }

  // Find paths in the value
  const key = adjustedKeys.at(-1);
  const { crawlablePaths, resourcePaths } = await findPaths(
    value,
    key,
    baseUrl,
    path
  );

  return {
    crawlablePaths,
    keys: adjustedKeys,
    path,
    resourcePaths,
    value,
  };
}

async function traverse(tree, ...keys) {
  if (tree.resolve && keys.length > 1) {
    // Tree like SiteTree that supports resolve() method
    const lastKey = keys.pop();
    const path = keys.join("/");
    const resolved = tree.resolve(path);
    return resolved.get(lastKey);
  } else {
    // Regular async tree
    return Tree.traverse(tree, ...keys);
  }
}

crawl.usage = `@crawl <tree>\tCrawl a tree`;
crawl.documentation = "https://weborigami.org/language/@crawl.html";
