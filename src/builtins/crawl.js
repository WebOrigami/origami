import { dirname, extname, resolve } from "node:path";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ObjectGraph from "../core/ObjectGraph.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

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

    const keys = path.split("/");
    if (keys.length === 0) {
      continue;
    }
    if (keys[0] === "") {
      // Discard first empty key
      keys.shift();
    }
    if (keys[keys.length - 1] === "") {
      // Trailing slash; get index.html
      keys[keys.length - 1] = "index.html";
    }

    // Get value from graph
    let value = await ExplorableGraph.traverse(graph, ...keys);
    if (ExplorableGraph.isExplorable(value)) {
      // Path is actually a directory; see if it has an index.html
      keys.push("index.html");
      value = await ExplorableGraph.traverse(value, "index.html");
    }

    if (value === undefined) {
      continue;
    }

    // Cache value
    let parent = cache;
    while (keys.length > 1) {
      const key = keys.shift();
      if (!parent[key]) {
        parent[key] = {};
      }
      parent = parent[key];
    }
    const key = keys.shift();
    parent[key] = value;

    // We guess the value is HTML is if its key has an .html extension or
    // doesn't have an extension, or the value starts with `<`.
    const ext = extname(key);
    const probablyHtml =
      ext === ".html" || ext === "" || value.trim?.().startsWith("<");
    let paths;
    if (probablyHtml) {
      paths = await findPathsInHtml(String(value));
    } else if (ext === ".css") {
      paths = await findPathsInCss(String(value));
    } else {
      // Don't crawl non-HTML or non-CSS files.
      continue;
    }

    // Filter out paths that start with a protocol that's not http or https.
    const httpPaths = paths.filter((path) => {
      const protocolRegex = /^(?<protocol>[^:]+):/;
      const match = path.match(protocolRegex);
      const protocol = match?.groups.protocol ?? "";
      return protocol === "http" || protocol === "https" || protocol === "";
    });

    // Filter out non-local paths.
    const localPaths = httpPaths.filter((path) => !path.startsWith("http"));

    // Resolve paths relative to the current directory.
    const dir = dirname(path);
    const resolvedPaths = localPaths.map((localPath) =>
      resolve(dir, localPath)
    );

    // Filter out paths we've already seen.
    const newPaths = resolvedPaths.filter((path) => !seenPaths.has(path));

    // Add new paths to the queue.
    pathQueue.push(...newPaths);

    // Add new paths to the set of paths we've seen.
    newPaths.forEach((path) => seenPaths.add(path));
  }

  const result = new (InheritScopeTransform(ObjectGraph))(cache);
  result.parent = this;
  return result;
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

crawl.usage = `crawl <graph>\tCrawl a graph`;
crawl.documentation = "https://graphorigami.org/cli/builtins.html#crawl";
