import { assertIsTreelike, Tree } from "@weborigami/async-tree";
import jsonFeedToRss from "@weborigami/json-feed-to-rss";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {Treelike} jsonFeed
 * @param {any} options
 */
export default async function rss(jsonFeed, options = {}) {
  assertIsTreelike(jsonFeed, "rss");
  const jsonFeedPlain = await Tree.plain(jsonFeed);
  return jsonFeedToRss(jsonFeedPlain, options);
}
