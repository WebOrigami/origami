import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function feedRss(jsonFeedGraph) {
  const jsonFeed = await ExplorableGraph.plain(jsonFeedGraph);
  const { description, home_page_url, items, feed_url, title } = jsonFeed;

  // Presume that the RSS feed lives in same location as feed_url.
  const parts = feed_url.split("/");
  parts.pop();
  parts.push("rss.xml");
  const rssUrl = parts.join("/");

  const itemsRss = items?.map((story) => itemRss(story)).join("\n") ?? [];

  return `<?xml version="1.0" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <atom:link href="${rssUrl}" rel="self" type="application/rss+xml"/>
    <title>${title}</title>
    <link>${home_page_url}</link>
    <description>${description}</description>
  ${itemsRss}</channel>
</rss>`;
}

function itemRss(jsonFeedItem) {
  const { content_html, date_published, id, title, url } = jsonFeedItem;
  // RSS wants dates in RFC-822.
  const date = date_published?.toUTCString() ?? null;
  const dateElement = date ? `      <pubDate>${date}</pubDate>\n` : "";
  return `    <item>
      ${dateElement}<title>${title}</title>
      <link>${url}</link>
      <guid>${id}</guid>
      <description><![CDATA[${content_html}]]></description>
    </item>
`;
}

feedRss.usage = `feedRss(feed)\tTransforms a JSON Feed object to RSS XML`;
