import { symbols } from "@weborigami/async-tree";
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

  let errors;

  // Iterate through all the resources to crawl the whole tree. We only care
  // about the final error report.
  for await (const result of crawlResources(tree, baseUrl)) {
    if (result.path === "crawl-errors.json") {
      errors = JSON.parse(result.value);
      errors[symbols.parent] = this;
      errors[symbols.deep] = true;
    }
  }

  return errors;
}
