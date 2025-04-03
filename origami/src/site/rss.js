import { Tree } from "@weborigami/async-tree";
import jsonFeedToRss from "@weborigami/json-feed-to-rss";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} jsonFeedTree
 * @param {any} options
 */
export default async function rss(jsonFeedTree, options = {}) {
  assertTreeIsDefined(this, "site:rss");
  const jsonFeed = await Tree.plain(jsonFeedTree);
  return jsonFeedToRss(jsonFeed, options);
}
