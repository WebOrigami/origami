import * as trailingSlash from "./trailingSlash.js";
import { setParent } from "./utilities.js";

/**
 * A tree of values obtained via HTTP/HTTPS calls. These values will be strings
 * for HTTP responses with a MIME text type; otherwise they will be ArrayBuffer
 * instances.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class SiteTree {
  /**
   * @param {string} href
   */
  constructor(href = window?.location.href) {
    if (href?.startsWith(".") && window?.location !== undefined) {
      // URL represents a relative path; concatenate with current location.
      href = new URL(href, window.location.href).href;
    }

    // Add trailing slash if not present; URL should represent a directory.
    href = trailingSlash.add(href);

    this.href = href;
    this.parent = null;
  }

  /** @returns {Promise<any>} */
  async get(key) {
    if (key == null) {
      // Reject nullish key.
      throw new ReferenceError(
        `${this.constructor.name}: Cannot get a null or undefined key.`
      );
    }

    // A key with a trailing slash and no extension is for a folder; return a
    // subtree without making a network request.
    if (trailingSlash.has(key) && !key.includes(".")) {
      const href = new URL(key, this.href).href;
      const value = Reflect.construct(this.constructor, [href]);
      setParent(value, this);
      return value;
    }

    // HACK: For now we don't allow lookup of Origami extension handlers.
    if (key.endsWith("_handler")) {
      return undefined;
    }

    const href = new URL(key, this.href).href;

    // Fetch the data at the given route.
    let response;
    try {
      response = await fetch(href);
    } catch (error) {
      return undefined;
    }

    return this.processResponse(response);
  }

  /**
   * Returns an empty set of keys.
   *
   * For a variation of `SiteTree` that can return the keys for a site route,
   * see [ExplorableSiteTree](ExplorableSiteTree.html).
   *
   * @returns {Promise<Iterable<string>>}
   */
  async keys() {
    return [];
  }

  // Return true if the given media type is a standard text type.
  static mediaTypeIsText(mediaType) {
    if (!mediaType) {
      return false;
    }
    const regex = /^(?<type>[^/]+)\/(?<subtype>[^;]+)/;
    const match = mediaType.match(regex);
    if (!match) {
      return false;
    }
    const { type, subtype } = match.groups;
    if (type === "text") {
      return true;
    } else if (type === "application") {
      return (
        subtype === "json" ||
        subtype.endsWith("+json") ||
        subtype.endsWith(".json") ||
        subtype === "xml" ||
        subtype.endsWith("+xml") ||
        subtype.endsWith(".xml")
      );
    }
    return false;
  }

  get path() {
    return this.href;
  }

  processResponse(response) {
    if (!response.ok) {
      return undefined;
    }

    const mediaType = response.headers?.get("Content-Type");
    if (SiteTree.mediaTypeIsText(mediaType)) {
      return response.text();
    } else {
      const buffer = response.arrayBuffer();
      setParent(buffer, this);
      return buffer;
    }
  }

  get url() {
    return new URL(this.href);
  }
}
