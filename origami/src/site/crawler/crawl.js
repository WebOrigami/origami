import {
  DeepObjectTree,
  Tree,
  deepMerge,
  isPlainObject,
  keysFromPath,
  trailingSlash,
} from "@weborigami/async-tree";
import { InvokeFunctionsTransform } from "@weborigami/language";
import getTreeArgument from "../../misc/getTreeArgument.js";
import crawlResources from "./crawlResources.js";

/**
 * Crawl a tree, starting its root index.html page, and following links to
 * crawlable pages, scripts, and stylesheets.
 *
 * Returns a new tree of the crawled content. The crawled content will be
 * in-memory. Referenced resources like images will be represented as functions
 * that obtain the requested value from the original site.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {string} [baseHref]
 * @returns {Promise<AsyncTree>}
 */
export default async function crawlBuiltin(treelike, baseHref) {
  const tree = await getTreeArgument(this, arguments, treelike, "@crawl");

  if (baseHref === undefined) {
    // Ask tree or original treelike if it has an `href` property we can use as
    // the base href to determine whether a link is local within the tree or
    // not. If not, use a fake `local:/` base href.
    baseHref =
      /** @type {any} */ (tree).href ??
      /** @type {any} */ (treelike).href ??
      "local:/";
    if (!baseHref?.endsWith("/")) {
      baseHref += "/";
    }
  } else {
    // Is the href already valid?
    let isHrefValid = false;
    try {
      new URL(baseHref);
      isHrefValid = true;
    } catch (e) {
      // Ignore
    }
    if (!isHrefValid) {
      // Use a fake base href.
      baseHref = `local:/${baseHref}`;
    }
  }

  // @ts-ignore
  const baseUrl = new URL(baseHref);

  const cache = {};
  const resources = {};
  const errors = [];

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
  const result = deepMerge(
    new DeepObjectTree(cache),
    new (InvokeFunctionsTransform(DeepObjectTree))(resources)
  );
  return result;
}

function addValueToObject(object, keys, value) {
  for (let i = 0, current = object; i < keys.length; i++) {
    const key = trailingSlash.remove(keys[i]);
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
        // Already have a value at this point. The site has a page at a route
        // like /foo, and the site also has resources within that at routes like
        // /foo/bar.jpg. We move the current value to "index.html".
        current[key] = { "index.html": current[key] };
      }
      current = current[key];
    }
  }
}

crawlBuiltin.usage = `@crawl <tree>\tCrawl a tree`;
crawlBuiltin.documentation = "https://weborigami.org/language/@crawl.html";
