import assert from "node:assert";
import { describe, test } from "node:test";
import rss from "../../src/site/rss.js"; // Adjust the import path according to your project structure

describe("@rss", () => {
  test("converts a simple JSON Feed entry with one item to RSS format", async () => {
    const jsonFeed = {
      title: "Test Feed",
      home_page_url: "http://example.com",
      feed_url: "http://example.com/feed.json",
      description: "This is a test feed",
      items: [
        {
          id: "1",
          content_html: "This is an <strong>item</strong>.",
          url: "http://example.com/item",
          title: "Test of <strong>item</strong>",
        },
      ],
    };
    const options = { language: "en-us" };
    const result = await rss.call(null, jsonFeed, options);

    const expectedRSS = `<?xml version="1.0" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Test Feed</title>
    <description>This is a test feed</description>
    <link>http://example.com</link>
    <language>en-us</language>
    <atom:link href="http://example.com/feed.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>Test of &lt;strong&gt;item&lt;/strong&gt;</title>
      <link>http://example.com/item</link>
      <guid isPermaLink="false">1</guid>
      <content:encoded><![CDATA[This is an <strong>item</strong>.]]></content:encoded>
    </item>
  </channel>
</rss>`;
    assert.equal(result, expectedRSS);
  });
});
