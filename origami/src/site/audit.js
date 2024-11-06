import { Tree } from "@weborigami/async-tree";
import getTreeArgument from "../misc/getTreeArgument.js";
import crawl from "./crawler/crawl.js";

/**
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {import("@weborigami/async-tree").Treelike} treelike
 */
export default async function siteAudit(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "site:audit");
  const crawled = await crawl.call(this, tree);
  let crawlErrorsJson = await crawled.get("crawl-errors.json");
  if (!crawlErrorsJson) {
    return undefined;
  }
  const errors = Tree.from(JSON.parse(crawlErrorsJson), { deep: true });
  errors.parent = this;
  return errors;
}
