import CSSOM from "rrweb-cssom";
import { isCrawlableHref, normalizeHref } from "./utilities.js";

export default function findPathsInCss(css) {
  const crawlablePaths = [];
  const resourcePaths = [];

  const cssom = new CSSOM.parse(css);
  const rules = cssom.cssRules;
  for (const rule of rules) {
    if (rule instanceof CSSOM.CSSFontFaceRule) {
      // @font-face
      const src = rule.style.getPropertyValue("src");
      const href = findUrl(src);
      if (isCrawlableHref(href)) {
        crawlablePaths.push(href);
      } else {
        resourcePaths.push(href);
      }
    } else if (rule instanceof CSSOM.CSSImportRule) {
      // @import
      const href = normalizeHref(rule.href);
      if (href) {
        if (isCrawlableHref(href)) {
          crawlablePaths.push(href);
        } else {
          resourcePaths.push(href);
        }
      }
    } else if (rule instanceof CSSOM.CSSStyleRule) {
      // Regular rule, search for `url()` functions
      const style = rule.style;
      for (let i = 0; i < style.length; i++) {
        const name = style[i];
        const value = style.getPropertyValue(name);
        const href = findUrl(value);
        if (isCrawlableHref(href)) {
          crawlablePaths.push(href);
        } else {
          resourcePaths.push(href);
        }
      }
    }
  }

  return {
    crawlablePaths,
    resourcePaths,
  };
}

// Search for `url()` functions in a CSS value
function findUrl(propertyValue) {
  const urlRegex = /url\(["']?(?<href>[^"')]*?)["']?\)/g;
  const match = urlRegex.exec(propertyValue);
  const href = match?.groups?.href;
  return href ? normalizeHref(href) : null;
}
