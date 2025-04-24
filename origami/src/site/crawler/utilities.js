import { extension, trailingSlash } from "@weborigami/async-tree";

// A fake base URL used to handle cases where an href is relative and must be
// treated relative to some base URL.
const fakeBaseUrl = new URL("fake:/");

/**
 * Determine a URL we can use to determine whether a link is local within the
 * tree or not.
 *
 * If a baseHref is supplied, convert that to a URL. If it's a relative path,
 * use a fake base URL. If no baseHref is supplied, see if the `object`
 * parameter defines an `href` property and use that to construct a URL.
 *
 * @param {string|undefined} baseHref
 * @param {any} object
 */
export function getBaseUrl(baseHref, object) {
  let url;
  if (baseHref !== undefined) {
    // See if the href is valid
    try {
      url = new URL(baseHref);
    } catch (e) {
      // Invalid, probably a path; use a fake protocol
      url = new URL(baseHref, fakeBaseUrl);
    }
  } else if (object.href) {
    // Use href property on object
    let href = object.href;
    if (!href?.endsWith("/")) {
      href += "/";
    }
    url = new URL(href);
  } else {
    url = fakeBaseUrl;
  }
  return url;
}

export function isCrawlableHref(href) {
  // Use a fake base URL to cover the case where the href is relative.
  const url = new URL(href, fakeBaseUrl);
  const pathname = url.pathname;
  const lastKey = pathname.split("/").pop() ?? "";
  if (lastKey === "robots.txt" || lastKey === "sitemap.xml") {
    return true;
  }
  const ext = extension.extname(lastKey);
  // We assume an empty extension is HTML.
  const crawlableExtensions = [".html", ".css", ".js", ".map", ".xhtml", ""];
  return crawlableExtensions.includes(ext);
}

// Remove any search parameters or hash from the href. Preserve absolute or
// relative nature of URL. If the URL only has a search or hash, return null.
export function normalizeHref(href) {
  // Remove everything after a `#` or `?` character.
  const normalized = href.split(/[?#]/)[0];
  return normalized === "" ? null : normalized;
}

// For indexing and storage purposes, treat a path that ends in a trailing slash
// as if it ends in index.html.
export function normalizeKeys(keys) {
  const normalized = keys.slice();
  if (normalized.length === 0 || trailingSlash.has(normalized.at(-1))) {
    normalized.push("index.html");
  }
  return normalized;
}
