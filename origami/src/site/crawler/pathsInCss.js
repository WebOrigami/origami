import CSSOM from "rrweb-cssom";
import { addHref } from "./utilities.js";

export default function pathsInCss(css) {
  const paths = {
    crawlablePaths: [],
    resourcePaths: [],
  };

  const cssom = new CSSOM.parse(css);
  const rules = cssom.cssRules;
  for (const rule of rules) {
    if (rule instanceof CSSOM.CSSFontFaceRule) {
      // @font-face
      const src = rule.style.getPropertyValue("src");
      findUrlHrefs(src).forEach((href) => {
        addHref(paths, href, false);
      });
    } else if (rule instanceof CSSOM.CSSImportRule) {
      // @import
      addHref(paths, rule.href, true);
    } else if (rule instanceof CSSOM.CSSStyleRule) {
      const style = rule.style;
      for (let i = 0; i < style.length; i++) {
        const name = style[i];
        const value = style.getPropertyValue(name);
        const imageRules = ["cross-fade(", "image(", "image-set("];
        const isImageRule = imageRules.some((prefix) =>
          value.trim().startsWith(prefix)
        );
        const hrefs = isImageRule ? findImageHrefs(value) : findUrlHrefs(value);
        hrefs.forEach((href) => {
          addHref(paths, href, false);
        });
      }
    }
  }

  return paths;
}

// Find hrefs in properties for image() and image-set() functions, which can be
// plain strings or url() functions.
function findImageHrefs(text) {
  const hrefs = [];
  const hrefRegex = /"(?<string>.+?)"|url\("?(?<url>.+?)"?\)/g;
  let match;
  while ((match = hrefRegex.exec(text))) {
    const href = match?.groups?.string ?? match?.groups?.url;
    if (href) {
      hrefs.push(href);
    }
  }
  return hrefs;
}

// Find all hrefs in `url()` functions
export function findUrlHrefs(text) {
  const hrefs = [];
  const urlRegex = /url\(["']?(?<href>[^"')]*?)["']?\)/g;
  let match;
  while ((match = urlRegex.exec(text))) {
    const href = match?.groups?.href;
    if (href) {
      hrefs.push(href);
    }
  }
  return hrefs;
}
