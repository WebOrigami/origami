import {
  keysFromPath,
  pathFromKeys,
  trailingSlash,
  Tree,
} from "@weborigami/async-tree";
import findPaths from "./findPaths.js";

/**
 * Crawl the paths for the given tree, starting at the given base URL, and yield
 * the crawled resources.
 *
 * Each will include the HTML/script/stylesheet value retrieved at a given path.
 */
export default async function* crawlResources(tree, baseUrl) {
  // We want to kick off requests for new paths as quickly as we find them, then
  // yield whichever result finishes first. Unfortunately, Promise.any() only
  // tells us the result of the first promise to resolve, not which promise that
  // was. So we keep track of a dictionary mapping paths to a promise for the
  // value at that path. When a promise resolves, we mark it as resolved by
  // setting its entry in the dictionary to null.
  const promisesForPaths = {};

  // Keep track of which resources make which outbound links.
  const resourceOutboundReferences = {};

  let errorPaths = [];

  // Seed the promise dictionary with robots.txt at the root, a sitemap.xml at
  // the root, and an empty path indicating the current directory (relative to
  // the baseUrl).
  const initialPaths = ["/robots.txt", "/sitemap.xml", ""];
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

    if (result.value === null) {
      // Expected resource doesn't exist; add this to the errors. Exception: a
      // path in the set of initialPaths that doesn't exist is not an error.
      if (!initialPaths.includes(result.path)) {
        errorPaths.push(result.path);
      }
      continue;
    }

    // Add the crawlable paths to the map. Use the normalized keys (will include
    // "index.html" if the path ends in a trailing slash).
    const normalizedPath = pathFromKeys(result.normalizedKeys);
    resourceOutboundReferences[normalizedPath] = result.crawlablePaths;

    // Add promises for crawlable paths in the result.
    result.crawlablePaths.forEach((path) => {
      // Only add a promise for this path if we don't already have one.
      if (promisesForPaths[path] === undefined) {
        promisesForPaths[path] = processPath(tree, path, baseUrl);
      }
    });

    yield result;
  }

  if (errorPaths.length > 0) {
    // Create a map of the resources that refer to each missing resource.
    const errorsMap = {};
    for (const sourcePath in resourceOutboundReferences) {
      // Does this resource refer to any of the error paths?
      const targetPaths = resourceOutboundReferences[sourcePath];
      for (const targetPath of targetPaths) {
        if (errorPaths.includes(targetPath)) {
          errorsMap[sourcePath] ??= [];
          errorsMap[sourcePath].push(targetPath);
        }
      }
    }

    // Review the errors map to find any paths that could not be traced back to
    // a referring resource. These are internal crawler errors. We log them so
    // that the use can report them and we can investigate them.
    for (const errorPath of errorPaths) {
      if (!Object.values(errorsMap).flat().includes(errorPath)) {
        errorsMap["(unknown)"] ??= [];
        errorsMap["(unknown)"].push(errorPath);
      }
    }

    const errorsJson = JSON.stringify(errorsMap, null, 2);
    yield {
      normalizedKeys: ["crawl-errors.json"],
      path: "crawl-errors.json",
      resourcePaths: [],
      value: errorsJson,
    };
  }
}

async function processPath(tree, path, baseUrl) {
  // Don't process any path outside the baseUrl.
  const url = new URL(path, baseUrl);
  if (!url.pathname.startsWith(baseUrl.pathname)) {
    return {
      path,
      value: null,
    };
  }

  // Convert path to keys
  let keys = keysFromPath(path);

  // Paths (including those created by the filterPaths function above) will have
  // spaces, etc., escaped. In general, these need to be unescaped so we can
  // find them in the tree.
  keys = keys.map(decodeURIComponent);

  // Traverse tree to get value.
  let value = await Tree.traverse(tree, ...keys);
  let normalizedKeys = keys.slice();
  let normalizedPath = path;
  if (Tree.isTreelike(value)) {
    // Path is actually a directory. See if we can get the empty string or
    // "index.html".
    value =
      (await Tree.traverse(value, "")) ??
      (await Tree.traverse(value, "index.html"));
    if (value !== undefined) {
      if (path.length > 0) {
        // Mark the path as ending in a slash
        normalizedPath = trailingSlash.add(path);
        const key = normalizedKeys.pop();
        normalizedKeys.push(trailingSlash.add(key));
      }

      // Add index.html to keys if it's not already there
      if (normalizedKeys.at(-1) !== "index.html") {
        normalizedKeys.push("index.html");
      }
    }
  }

  if (value === undefined && path.length > 0) {
    // The path may be a URL like `foo` or `foo/` that points to `foo.html`, so
    // we'll try looking adding `.html` to the end. We don't want to check every
    // path twice, so we only do this if the last key does *not* include an
    // extension.
    const lastKey = keys.at(-1);
    if (lastKey !== "" && !lastKey?.includes(".")) {
      const adjustedLastKey = `${trailingSlash.remove(lastKey)}.html`;
      const adjustedKeys = [...keys.slice(0, -1), adjustedLastKey];
      value = await Tree.traverse(tree, ...adjustedKeys);
      if (value !== undefined) {
        // Page exists at foo.html
        normalizedPath = pathFromKeys(adjustedKeys);
        normalizedKeys = adjustedKeys;
      }
    }
  }

  if (value === undefined) {
    return {
      crawlablePaths: [],
      keys,
      normalizedKeys,
      path,
      resourcePaths: [],
      value: null,
    };
  }

  // Find paths in the value
  const key = normalizedKeys.at(-1);
  const { crawlablePaths, resourcePaths } = await findPaths(
    value,
    key,
    baseUrl,
    normalizedPath
  );

  return {
    crawlablePaths,
    keys,
    normalizedKeys,
    path,
    resourcePaths,
    value,
  };
}
