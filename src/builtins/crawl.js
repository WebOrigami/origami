import { extname } from "node:path";
import InvokeFunctionsTransform from "../common/InvokeFunctionsTransform.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ObjectGraph from "../core/ObjectGraph.js";
import { isPlainObject, keysFromPath } from "../core/utilities.js";

const localProtocol = "local:";

/**
 * Crawl a graph, starting its root index.html page, and following links to
 * other pages and resources. Return a new graph of the crawled content.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 * @returns {Promise<Explorable>}
 */
export default async function crawl(variant) {
  const graph = ExplorableGraph.from(variant);
  const cache = {};
  const pathQueue = ["/"];
  const seenPaths = new Set();

  while (pathQueue.length > 0) {
    const path = pathQueue.shift();
    if (!path) {
      continue;
    }

    // Based on the extension, do we want to get the value?
    const keys = keysFromPath(path);
    if (!hasCrawlableExtension(keys.at(-1))) {
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
    const paths = await findPaths(value, key, path);

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

class CrawledGraph {
  constructor(graph, cache) {
    this.graph = graph;
    this.cache = cache;
  }

  async *[Symbol.asyncIterator]() {
    yield* this.cache;
  }

  async get(key) {
    return this.traverse(key);
  }

  async traverse(...keys) {
    const cacheValue = await ExplorableGraph.traverse(this.cache, ...keys);
    const graphValue =
      cacheValue === undefined
        ? await ExplorableGraph.traverse(this.graph, ...keys)
        : undefined;
    if (ExplorableGraph) {
    }
  }
}

function findPaths(value, key, basePath) {
  // We guess the value is HTML is if its key has an .html extension or
  // doesn't have an extension, or the value starts with `<`.
  const ext = key ? extname(key) : "";
  const probablyHtml =
    ext === ".html" || ext === "" || value.trim?.().startsWith("<");
  let paths;
  if (probablyHtml) {
    paths = findPathsInHtml(String(value));
  } else if (ext === ".css") {
    paths = findPathsInCss(String(value));
  } else if (ext === ".js") {
    paths = findPathsInJs(String(value));
  } else {
    // Doesn't have an extension we want to process
    return [];
  }

  // Convert paths to URLs relative to the given base path.
  const baseUrl = new URL(`${localProtocol}/${basePath}`);
  const urls = paths.map((path) => new URL(path, baseUrl));

  // Filter URLs that start with our fake local protocol.
  // This weeds out URLs pointing to other sites.
  const localUrls = urls.filter((url) => url.protocol === localProtocol);

  // Convert URLs back to paths.
  const localPaths = localUrls.map((url) => url.pathname);
  return localPaths;
}

function findPathsInCss(css) {
  const paths = [];
  let match;

  // Find `url()` functions.
  const urlRegex = /url\(["']?(?<url>[^"')]*?)["']?\)/g;
  while ((match = urlRegex.exec(css))) {
    paths.push(match.groups.url);
  }

  return paths;
}

function findPathsInJs(js) {
  const paths = [];
  let match;

  // Find `import` statements.
  const importRegex = /import [\s\S]+?from\s+["'](?<import>[^"']*)["'];/g;
  while ((match = importRegex.exec(js))) {
    paths.push(match.groups.import);
  }

  return paths;
}

function findPathsInHtml(html) {
  const paths = [];
  let match;

  // Find `href` attributes in anchor and link tags.
  const linkRegex = /<(?:a|link) [^>]*?href=["'](?<link>[^>]*?)["'][^>]*>/g;
  while ((match = linkRegex.exec(html))) {
    paths.push(match.groups.link);
  }

  // Find `src` attributes in img and script tags.
  const srcRegex = /<(?:img|script) [^>]*?src=["'](?<src>[^>]*?)["'][^>]*>/g;
  while ((match = srcRegex.exec(html))) {
    paths.push(match.groups.src);
  }

  // Find `url()` functions in CSS.
  const urlRegex = /url\(["']?(?<url>[^"')]*?)["']?\)/g;
  while ((match = urlRegex.exec(html))) {
    paths.push(match.groups.url);
  }

  return paths;
}

function hasCrawlableExtension(key) {
  if (key === undefined) {
    // Tantamount to "index.html"
    return true;
  }
  const ext = extname(key);
  const crawlableExtensions = [".html", ".css", ".js", ""];
  return crawlableExtensions.includes(ext);
}

crawl.usage = `crawl <graph>\tCrawl a graph`;
crawl.documentation = "https://graphorigami.org/cli/builtins.html#crawl";
