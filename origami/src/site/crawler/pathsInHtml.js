import { JSDOM } from "jsdom";
import pathsInCss from "./pathsInCss.js";
import pathsInJs from "./pathsInJs.js";
import { isCrawlableHref, normalizeHref } from "./utilities.js";

export default function findPathsInHtml(html) {
  const crawlablePaths = [];
  const resourcePaths = [];

  const dom = JSDOM.fragment(html);

  // Find `href` attributes in anchor, area, and link tags.
  const hrefTags = dom.querySelectorAll("a[href], area[href], link[href]");
  for (const hrefTag of hrefTags) {
    const href = normalizeHref(hrefTag.getAttribute("href"));
    if (href) {
      if (isCrawlableHref(href)) {
        crawlablePaths.push(href);
      } else {
        resourcePaths.push(href);
      }
    }
  }

  // Find `src` attributes in frame, img, and script tags.
  const srcTags = dom.querySelectorAll("frame[src], img[src], script[src]");
  for (const srcTag of srcTags) {
    const src = normalizeHref(srcTag.getAttribute("src"));
    if (src) {
      if (srcTag.tagName === "FRAME" || srcTag.tagName === "SCRIPT") {
        crawlablePaths.push(src);
      } else {
        resourcePaths.push(src);
      }
    }
  }

  // Find paths in CSS in <style> tags.
  const styleTags = dom.querySelectorAll("style");
  for (const styleTag of styleTags) {
    const css = styleTag.textContent;
    const cssResults = pathsInCss(css);
    crawlablePaths.push(...cssResults.crawlablePaths);
    resourcePaths.push(...cssResults.resourcePaths);
  }

  // Find ancient `background` attribute on body tag.
  const body = dom.querySelector("body[background]");
  if (body) {
    const href = normalizeHref(body.getAttribute("background"));
    if (href) {
      resourcePaths.push(href);
    }
  }

  // Also look for JS `import` statements that might be in <script type="module"> tags.
  const scriptTags = dom.querySelectorAll("script[type='module']");
  for (const scriptTag of scriptTags) {
    const jsResults = pathsInJs(scriptTag.textContent);
    crawlablePaths.push(...jsResults.crawlablePaths);
  }

  return { crawlablePaths, resourcePaths };
}
