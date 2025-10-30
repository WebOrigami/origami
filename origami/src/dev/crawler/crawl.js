import {
  DeepObjectMap,
  Tree,
  getTreeArgument,
  keysFromPath,
} from "@weborigami/async-tree";
import crawlResources from "./crawlResources.js";
import { addValueToObject, getBaseUrl } from "./utilities.js";

/**
 * Crawl a tree, starting its root index.html page, and following links to
 * crawlable pages, scripts, and stylesheets.
 *
 * Returns a new tree of the crawled content. The crawled content will be
 * in-memory. Referenced resources like images will be represented as functions
 * that obtain the requested value from the original site.
 *
 * @typedef {import("@weborigami/async-tree").AsyncMap} AsyncMap
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {string} [baseHref]
 * @returns {Promise<AsyncMap>}
 */
export default async function crawlBuiltin(maplike, baseHref) {
  const tree = await getTreeArgument(maplike, "crawl");
  const baseUrl = getBaseUrl(baseHref, maplike);

  const cache = {};
  const resources = {};

  // We iterate until there are no more promises to wait for.
  for await (const result of crawlResources(tree, baseUrl)) {
    const { normalizedKeys, resourcePaths, value } = result;

    // Cache the value
    if (value) {
      addValueToObject(cache, normalizedKeys, value);
    }

    // Add indirect resource functions to the resource tree. When requested,
    // these functions will obtain the resource from the original site.
    for (const resourcePath of resourcePaths) {
      const resourceKeys = keysFromPath(resourcePath);
      const fn = () => {
        return Tree.traverse(tree, ...resourceKeys);
      };
      addValueToObject(resources, resourceKeys, fn);
    }
  }

  // Merge the cache on top of the resources tree. If we have an actual value
  // for something already, that's better than a function that will get that
  // value.
  const result = Tree.deepMerge(
    new DeepObjectMap(cache),
    await Tree.invokeFunctions(resources, { deep: true })
  );
  return result;
}
