import { getTreeArgument, Tree } from "@weborigami/async-tree";
import jsonFeedToRss from "@weborigami/json-feed-to-rss";

/**
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} jsonFeed
 * @param {any} options
 */
export default async function rss(jsonFeed, options = {}) {
  const tree = await getTreeArgument(jsonFeed, "rss");
  const jsonFeedPlain = await Tree.plain(tree);
  return jsonFeedToRss(jsonFeedPlain, options);
}
