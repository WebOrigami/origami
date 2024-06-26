import { Tree } from "@weborigami/async-tree";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} jsonFeedTree
 */
export default async function rss(jsonFeedTree) {
  assertScopeIsDefined(this, "rss");
  const jsonFeed = await Tree.plain(jsonFeedTree);
  const { description, home_page_url, items, feed_url, title } = jsonFeed;

  // Presume that the RSS feed lives in same location as feed_url.
  const parts = feed_url.split("/");
  parts.pop();
  parts.push("rss.xml");
  const rssUrl = parts.join("/");

  const itemsRss = items?.map((story) => itemRss(story)).join("") ?? [];

  return `<?xml version="1.0" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <atom:link href="${rssUrl}" rel="self" type="application/rss+xml"/>
    <title><![CDATA[${title}]]></title>
    <link>${home_page_url}</link>
    <description>${description}</description>
${itemsRss}</channel>
</rss>`;
}

function itemRss(jsonFeedItem) {
  const { content_html, date_published, id, title, url } = jsonFeedItem;
  // RSS wants dates in RFC-822, essentially the same as ISO 8601.
  const date =
    date_published instanceof Date
      ? date_published.toUTCString()
      : date_published;
  const dateElement = date ? `      <pubDate>${date}</pubDate>\n` : "";
  const guidElement = id ? `      <guid>${id}</guid>\n` : "";
  const contentElement = content_html
    ? `      <description><![CDATA[${content_html}]]></description>\n`
    : "";
  const titleElement = `<![CDATA[${title}]]>`;
  return `    <item>
${dateElement}      <title>${titleElement}</title>
      <link>${url}</link>
${guidElement}${contentElement}    </item>
`;
}

rss.usage = `@rss <feed>\tTransforms a JSON Feed tree to RSS XML`;
rss.documentation = "https://weborigami.org/language/@rss.html";
