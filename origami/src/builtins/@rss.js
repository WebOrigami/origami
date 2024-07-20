import { Tree } from "@weborigami/async-tree";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} jsonFeedTree
 * @param {any} options
 */
export default async function rss(jsonFeedTree, options = {}) {
  assertTreeIsDefined(this, "rss");
  const jsonFeed = await Tree.plain(jsonFeedTree);
  const { description, home_page_url, items, title } = jsonFeed;

  let { feed_url, language } = options;
  if (!feed_url && jsonFeed.feed_url) {
    // Presume that the RSS feed lives in same location as feed_url
    // but with a .xml extension.
    feed_url = jsonFeed.feed_url;
    if (feed_url.endsWith(".json")) {
      feed_url = feed_url.replace(".json", ".xml");
    }
  }

  const itemsRss = items?.map((story) => itemRss(story)).join("") ?? [];

  const titleElement = title ? `    <title>${escapeXml(title)}</title>\n` : "";
  const descriptionElement = description
    ? `    <description>${escapeXml(description)}</description>\n`
    : "";
  const linkElement = home_page_url
    ? `    <link>${home_page_url}</link>\n`
    : "";
  const languageElement = language
    ? `    <language>${language}</language>\n`
    : "";
  const feedLinkElement = `    <atom:link href="${feed_url}" rel="self" type="application/rss+xml"/>\n`;
  // const feedLinkElement = `    <link rel="self" type="application/atom+xml" href="${feed_url}"/>\n`;

  return `<?xml version="1.0" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
${titleElement}${descriptionElement}${linkElement}${languageElement}${feedLinkElement}${itemsRss}  </channel>
</rss>`;
}

function itemRss(jsonFeedItem) {
  const { content_html, id, summary, title, url } = jsonFeedItem;
  let { date_published } = jsonFeedItem;
  if (typeof date_published === "string") {
    // Parse as ISO 8601 date.
    date_published = new Date(date_published);
  }
  const date =
    date_published instanceof Date
      ? toRFC822Date(date_published)
      : date_published;

  const dateElement = date ? `      <pubDate>${date}</pubDate>\n` : "";
  const isPermaLink =
    id !== undefined && !URL.canParse(id) ? ` isPermaLink="false"` : "";
  const guidElement = id ? `      <guid${isPermaLink}>${id}</guid>\n` : "";
  const descriptionElement = summary
    ? `      <description>${escapeXml(summary)}</description>\n`
    : "";
  const contentElement = content_html
    ? `      <content:encoded><![CDATA[${content_html}]]></content:encoded>\n`
    : "";
  const titleElement = title
    ? `      <title>${escapeXml(title)}</title>\n`
    : "";
  const linkElement = url ? `      <link>${url}</link>\n` : "";

  return `    <item>
${dateElement}${titleElement}${linkElement}${guidElement}${descriptionElement}${contentElement}    </item>
`;
}

// Escape XML entities for in the text.
function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// RSS wants dates in RFC-822.
function toRFC822Date(date) {
  const day = days[date.getUTCDay()];
  const dayOfMonth = date.getUTCDate().toString().padStart(2, "0");
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  return `${day}, ${dayOfMonth} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
}

rss.usage = `@rss <feed>\tTransforms a JSON Feed tree to RSS XML`;
rss.documentation = "https://weborigami.org/language/@rss.html";
