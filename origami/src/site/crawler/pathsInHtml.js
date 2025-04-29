import { JSDOM, VirtualConsole } from "jsdom";
import pathsInCss from "./pathsInCss.js";
import pathsInJs from "./pathsInJs.js";
import { addHref } from "./utilities.js";

export default function pathsInHtml(html) {
  const paths = {
    crawlablePaths: [],
    resourcePaths: [],
  };

  // Create a virtual console to avoid logging errors to the console
  const virtualConsole = new VirtualConsole();
  const document = new JSDOM(html, { virtualConsole }).window.document;

  // Find `href` attributes in anchor, area, link, SVG tags.
  //
  // NOTE: As of April 2024, jsdom querySelectorAll does not appear to find
  // elements with mixed-case tag names.
  const hrefTags = document.querySelectorAll(
    "a[href], area[href], image[href], feImage[href], filter[href], linearGradient[href], link[href], mpath[href], pattern[href], radialGradient[href], textPath[href], use[href]"
  );
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

  // Find paths in <meta> image tags.
  const imageMetaTags = document.querySelectorAll('meta[property$=":image"]');
  for (const imageMetaTag of imageMetaTags) {
    const content = imageMetaTag.getAttribute("content");
    if (content) {
      addHref(paths, content, false);
    }
  }

  // Find paths in CSS in <style> tags.
  const styleTags = document.querySelectorAll("style");
  for (const styleAttribute of styleTags) {
    const cssPaths = pathsInCss(styleAttribute.textContent);
    paths.crawlablePaths.push(...cssPaths.crawlablePaths);
    paths.resourcePaths.push(...cssPaths.resourcePaths);
  }

  // Find URLs in CSS in `style` attributes.
  const styleAttributeTags = document.querySelectorAll("[style]");
  for (const tag of styleAttributeTags) {
    const style = tag.getAttribute("style");
    const stylePaths = pathsInCss(style, "declarationList");
    stylePaths.resourcePaths.forEach((href) => {
      addHref(paths, href, false);
    });
  }

  // Find URLs in SVG attributes.
  const svgAttributeNames = [
    "clip-path",
    "fill",
    "filter",
    "marker-end",
    "marker-start",
    "mask",
    "stroke",
  ];
  const svgTags = document.querySelectorAll(
    svgAttributeNames.map((name) => `[${name}]`).join(", ")
  );
  for (const svgTag of svgTags) {
    for (const name of svgAttributeNames) {
      const attributeValue = svgTag.getAttribute(name);
      if (!attributeValue) {
        continue;
      }
      const urlRegex = /url\((['"]?)(?<href>.*?)\1\)/g;
      const attributeValueMatch = urlRegex.exec(attributeValue);
      if (attributeValueMatch) {
        const href = attributeValueMatch.groups?.href;
        if (href) {
          addHref(paths, href, false);
        }
      }
    }
  }

  // Also look for JS `import` statements that might be in <script type="module"> tags.
  const scriptTags = document.querySelectorAll("script[type='module']");
  for (const scriptTag of scriptTags) {
    const jsPaths = pathsInJs(scriptTag.textContent);
    paths.crawlablePaths.push(...jsPaths.crawlablePaths);
  }

  // Special handling for <noframes> in framesets. We need to use a regex for
  // this because the jsdom parser supports frames, so it will treat a
  // <noframes> tag as a text node.
  const noframesRegex = /<noframes>(?<html>[\s\S]*?)<\/noframes>/g;
  let match;
  while ((match = noframesRegex.exec(html))) {
    const noframesHtml = match.groups?.html;
    if (noframesHtml) {
      const noframesPaths = pathsInHtml(noframesHtml);
      paths.crawlablePaths.push(...noframesPaths.crawlablePaths);
      paths.resourcePaths.push(...noframesPaths.resourcePaths);
    }
  }

  return paths;
}
