import { extension, toString } from "@weborigami/async-tree";
import pathsInCss from "./pathsInCss.js";
import pathsInHtml from "./pathsInHtml.js";
import pathsInImageMap from "./pathsInImageMap.js";
import pathsInJs from "./pathsInJs.js";
import pathsInRobotsTxt from "./pathsInRobotsTxt.js";
import pathsInSitemap from "./pathsInSitemap.js";

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
export default async function findPaths(value, key, baseUrl, localPath) {
  const text = toString(value);
  if (text === null) {
    return {
      crawlablePaths: [],
      resourcePaths: [],
    };
  }

  // We guess the value is HTML is if its key has an .html extension or
  // doesn't have an extension, or the value starts with `<`.
  const ext = key ? extension.extname(key).toLowerCase() : "";
  let foundPaths;
  if (ext === ".html" || ext === ".htm" || ext === ".xhtml") {
    foundPaths = await pathsInHtml(text);
  } else if (ext === ".css") {
    foundPaths = pathsInCss(text);
  } else if (ext === ".js") {
    foundPaths = pathsInJs(text);
  } else if (ext === ".map") {
    foundPaths = pathsInImageMap(text);
  } else if (key === "robots.txt") {
    foundPaths = pathsInRobotsTxt(text);
  } else if (key === "sitemap.xml") {
    foundPaths = pathsInSitemap(text);
  } else if (ext === "" && text?.trim().startsWith("<")) {
    // Probably HTML
    foundPaths = await pathsInHtml(text);
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
