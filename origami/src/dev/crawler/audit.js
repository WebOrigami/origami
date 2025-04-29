import { pathFromKeys, symbols, Tree } from "@weborigami/async-tree";
import getTreeArgument from "../../common/getTreeArgument.js";
import crawlResources from "./crawlResources.js";
import { getBaseUrl } from "./utilities.js";

/**
 * Crawl the indicated tree and return an audit of any broken links to internal
 * pages or other resources.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {string} [baseHref]
 */
export default async function audit(treelike, baseHref) {
  const tree = await getTreeArgument(this, arguments, treelike, "site:audit");
  const baseUrl = getBaseUrl(baseHref, treelike);

  let errors = {};
  let report;
  const resourceReferences = {};
  const resourcePromises = {};

  // Iterate through all the resources to crawl the whole tree.
  for await (const result of crawlResources(tree, baseUrl)) {
    const { normalizedKeys, resourcePaths, value: resource } = result;
    const normalizedPath = pathFromKeys(normalizedKeys);
    if (normalizedPath === "crawl-errors.json") {
      // Final error report; add missing pages to the errors
      report = JSON.parse(resource);
      for (const [path, pagePaths] of Object.entries(report)) {
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(...pagePaths);
      }
    } else {
      // Record which resources this path references
      resourceReferences[normalizedPath] = resourcePaths;

      // Add all resources to the set that should be verified
      for (const resourcePath of resourcePaths) {
        // Start request, don't wait for it to complete yet
        resourcePromises[resourcePath] ??= Tree.traversePath(
          tree,
          resourcePath
        ).then(
          // Just return true or false to indicate if value is defined
          (value) => value !== undefined
        );
      }
    }
  }

  // Add any references to missing resources to the errors
  for (const [refererPath, resourcePaths] of Object.entries(
    resourceReferences
  )) {
    for (const resourcePath of resourcePaths) {
      const found = await resourcePromises[resourcePath];
      if (!found) {
        if (!errors[refererPath]) {
          errors[refererPath] = [];
        }
        errors[refererPath].push(resourcePath);
      }
    }
  }

  if (Object.keys(errors).length === 0) {
    return undefined;
  }

  Object.defineProperty(errors, symbols.parent, {
    enumerable: false,
    value: this,
  });
  Object.defineProperty(errors, symbols.deep, {
    enumerable: false,
    value: true,
  });
  return errors;
}
