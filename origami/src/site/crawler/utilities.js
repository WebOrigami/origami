import {
  extension,
  isPlainObject,
  trailingSlash,
} from "@weborigami/async-tree";

// A fake base URL used to handle cases where an href is relative and must be
// treated relative to some base URL.
const fakeBaseUrl = new URL("fake:/");

/**
 * Destructively add a path to the paths object
 */
export function addHref(paths, href, isCrawlable) {
  href = normalizeHref(href);
  isCrawlable ??= isCrawlableHref(href);
  if (isCrawlable) {
    paths.crawlablePaths.push(href);
  } else {
    paths.resourcePaths.push(href);
  }
}

/**
 * Add the value to the object at the path given by the keys
 *
 * @param {any} object
 * @param {string[]} keys
 * @param {any} value
 */
export function addValueToObject(object, keys, value) {
  for (let i = 0, current = object; i < keys.length; i++) {
    const key = trailingSlash.remove(keys[i]);
    if (i === keys.length - 1) {
      // Write out value
      if (isPlainObject(current[key])) {
        // Route with existing values; treat the new value as an index.html
        current[key]["index.html"] = value;
      } else {
        current[key] = value;
      }
    } else {
      // Traverse further
      if (!current[key]) {
        current[key] = {};
      } else if (!isPlainObject(current[key])) {
        // Already have a value at this point. The site has a page at a route
        // like /foo, and the site also has resources within that at routes like
        // /foo/bar.jpg. We move the current value to "index.html".
        current[key] = { "index.html": current[key] };
      }
      current = current[key];
    }
  }
}

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
