import assert from "node:assert";
import { describe, test } from "node:test";
import pathsInHtml from "../../../src/site/crawler/pathsInHtml.js";

describe("pathsInHtml", () => {
  test("find href attributes", () => {
    const html = `
      <a href="page2.html">Next page</a>
      <area href="map2.html" shape="rect" coords="0,0,100,100" alt="Map region"></area>
      <link rel="stylesheet" href="style.css">
      <link rel="alternate" href="feed.xml" type="application/rss+xml" title="RSS feed">
    `;
    const paths = pathsInHtml(html);
    assert.deepEqual(paths, {
      crawlablePaths: ["page2.html", "map2.html", "style.css"],
      resourcePaths: ["feed.xml"],
    });
  });

  test("finds src attributes", () => {
    const html = `
      <img src="photo.jpg" alt="A photo">
      <input type="image" src="button.png" alt="Submit">
      <audio src="audio.mp3" controls></audio>
      <video src="video.mp4" controls></video>
      <embed src="embed.swf" type="application/x-shockwave-flash">
      <iframe src="frame.html"></iframe>
      <track src="track.vtt" kind="subtitles" srclang="en" label="English">
      <source src="source.mp4" type="video/mp4">
    `;
    const paths = pathsInHtml(html);
    assert.deepEqual(paths, {
      crawlablePaths: ["frame.html"],
      resourcePaths: [
        "photo.jpg",
        "button.png",
        "audio.mp3",
        "video.mp4",
        "embed.swf",
        "track.vtt",
        "source.mp4",
      ],
    });
  });

  test("finds frames in framesets", () => {
    const html = `
      <html>
        <frameset>
          <frame src="frame1.html">
          <frame src="frame2.html">
        </frameset>
      </html>
    `;
    const paths = pathsInHtml(html);
    assert.deepEqual(paths, {
      crawlablePaths: ["frame1.html", "frame2.html"],
      resourcePaths: [],
    });
  });

  test("find URLs in srcset attributes", () => {
    const html = `
      <source
        media="(min-width: 800px)"
        srcset="
          images/hero-large.jpg   800w,
          images/hero-large@2x.jpg 1600w
        "
      >
      <img
        src="images/hero-small.jpg"
        srcset="
          images/hero-small.jpg   200w,
          images/hero-small@2x.jpg 400w
        "
      >
    `;
    const paths = pathsInHtml(html);
    assert.deepEqual(paths, {
      crawlablePaths: [],
      resourcePaths: [
        "images/hero-small.jpg",
        "images/hero-large.jpg",
        "images/hero-large@2x.jpg",
        "images/hero-small.jpg",
        "images/hero-small@2x.jpg",
      ],
    });
  });

  test("finds poster in video elements", () => {
    const html = `
      <video
        id="media"
        src="assets/video.mp4"
        poster="assets/poster.jpg"
      >
      </video>
    `;
    const paths = pathsInHtml(html);
    assert.deepEqual(paths, {
      crawlablePaths: [],
      resourcePaths: ["assets/video.mp4", "assets/poster.jpg"],
    });
  });

  test("finds data in object elements", () => {
    const html = `
      <object
        type="video/mp4"
        data="/shared-assets/videos/flower.mp4"
        width="250"
        height="200"
      >
      </object>
    `;
    const paths = pathsInHtml(html);
    assert.deepEqual(paths, {
      crawlablePaths: [],
      resourcePaths: ["/shared-assets/videos/flower.mp4"],
    });
  });

  test("finds images in meta tags", () => {
    const html = `
      <meta property="og:image" content="og-image.png">
      <meta property="twitter:image" content="twitter-image.jpg">
      <meta property="fb:image" content="fb-image.png">
      <meta property="article:image" content="article-image.jpg">
    `;
    const paths = pathsInHtml(html);
    assert.deepEqual(paths, {
      crawlablePaths: [],
      resourcePaths: [
        "og-image.png",
        "twitter-image.jpg",
        "fb-image.png",
        "article-image.jpg",
      ],
    });
  });

  test("finds paths in <style> tags", () => {
    const html = `
      <style>
        @import url('import.css');
        body {
          background-image: url('background.jpg');
        }
      </style>
    `;
    const paths = pathsInHtml(html);
    assert.deepEqual(paths, {
      crawlablePaths: ["import.css"],
      resourcePaths: ["background.jpg"],
    });
  });

  test("finds paths in `style` attributes", () => {
    const html = `
      <div style="background-image: url('image.jpg');"></div>
      <div style="mask-image: url('images/mask.png');"></div>
    `;
    const paths = pathsInHtml(html);
    assert.deepEqual(paths, {
      crawlablePaths: [],
      resourcePaths: ["image.jpg", "images/mask.png"],
    });
  });

  // Finds scripts in <script> tags
  test("finds src in script elements", () => {
    const html = `
      <script src="old.js"></script>
      <script src="module.js" type="module"></script>
    `;
    const paths = pathsInHtml(html);
    assert.deepEqual(paths, {
      crawlablePaths: ["module.js"],
      resourcePaths: ["old.js"],
    });
  });

  // Finds scripts in text of module scripts
  test("finds src in module scripts", () => {
    const html = `
      <script type="module">
        import { foo } from "./foo.js";
        import { bar } from "./bar.js";
      </script>
    `;
    const paths = pathsInHtml(html);
    assert.deepEqual(paths, {
      crawlablePaths: ["./foo.js", "./bar.js"],
      resourcePaths: [],
    });
  });
});
