import { JSDOM } from "jsdom";
import pathsInCss from "./pathsInCss.js";
import pathsInJs from "./pathsInJs.js";
import { addHref } from "./utilities.js";

export default function findPathsInHtml(html) {
  const paths = {
    crawlablePaths: [],
    resourcePaths: [],
  };

  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find `href` attributes in anchor, area, and link tags.
  const hrefTags = document.querySelectorAll("a[href], area[href], link[href]");
  for (const hrefTag of hrefTags) {
    const crawlable = ["A", "AREA"].includes(hrefTag.tagName)
      ? true
      : undefined;
    addHref(paths, hrefTag.getAttribute("href"), crawlable);
  }

  // Find `src` attributes in input, frame, media, and script tags.
  const srcTags = document.querySelectorAll(
    "audio[src], embed[src], frame[src], iframe[src], img[src], input[src], script[src], source[src], track[src], video[src]"
  );
  for (const srcTag of srcTags) {
    const crawlable = ["FRAME", "IFRAME"].includes(srcTag.tagName)
      ? true
      : srcTag.tagName === "SCRIPT"
      ? srcTag.type === "module" // Only crawl modules
      : undefined;
    addHref(paths, srcTag.getAttribute("src"), crawlable);
  }

  // Find `srcset` attributes in image and source tags.
  const srcsetTags = document.querySelectorAll("img[srcset], source[srcset]");
  for (const srcsetTag of srcsetTags) {
    const srcset = srcsetTag.getAttribute("srcset");
    const srcRegex = /(?<url>[^\s,]+)(?=\s+\d+(?:\.\d+)?[wxh])/g;
    let match;
    while ((match = srcRegex.exec(srcset))) {
      if (match.groups?.url) {
        addHref(paths, match.groups.url, false);
      }
    }
  }

  // Find `poster` attributes in <video> tags.
  const posterTags = document.querySelectorAll("video[poster]");
  for (const posterTag of posterTags) {
    addHref(paths, posterTag.getAttribute("poster"), false);
  }

  // Find `data` attributes in <object> tags.
  const objectTags = document.querySelectorAll("object[data]");
  for (const objectTag of objectTags) {
    addHref(paths, objectTag.getAttribute("data"), false);
  }

  // Find ancient `background` attribute on body tag.
  const body = document.querySelector("body[background]");
  if (body) {
    addHref(paths, body.getAttribute("background"), false);
  }

  // Find paths in CSS in <style> tags.
  const styleTags = document.querySelectorAll("style");
  for (const styleTag of styleTags) {
    const cssPaths = pathsInCss(styleTag.textContent);
    paths.crawlablePaths.push(...cssPaths.crawlablePaths);
    paths.resourcePaths.push(...cssPaths.resourcePaths);
  }

  // Also look for JS `import` statements that might be in <script type="module"> tags.
  const scriptTags = document.querySelectorAll("script[type='module']");
  for (const scriptTag of scriptTags) {
    const jsPaths = pathsInJs(scriptTag.textContent);
    paths.crawlablePaths.push(...jsPaths.crawlablePaths);
  }

  return paths;
}
