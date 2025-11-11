import * as trailingSlash from "../trailingSlash.js";
import setParent from "../utilities/setParent.js";
import AsyncMap from "./AsyncMap.js";

/**
 * A tree of values obtained via HTTP/HTTPS calls. These values will be strings
 * for HTTP responses with a MIME text type; otherwise they will be ArrayBuffer
 * instances.
 */
export default class SiteMap extends AsyncMap {
  /**
   * @param {string} href
   */
  constructor(href = globalThis?.location.href) {
    super();

    if (href?.startsWith(".") && globalThis?.location !== undefined) {
      // URL represents a relative path; concatenate with current location.
      href = new URL(href, globalThis.location.href).href;
    }

    // Add trailing slash if not present; URL should represent a directory.
    href = trailingSlash.add(href);

    this.href = href;
  }

  /** @returns {Promise<ArrayBuffer|string|undefined>} */
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
   * For a variation of `SiteMap` that can return the keys for a site route,
   * see [ExplorableSiteMap](ExplorableSiteMap.html).
   *
   * @returns {AsyncIterableIterator<string>}
   */
  async *keys() {
    yield* [];
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
    }
    return (
      subtype === "json" ||
      subtype.endsWith("+json") ||
      subtype.endsWith(".json") ||
      subtype === "xml" ||
      subtype.endsWith("+xml") ||
      subtype.endsWith(".xml")
    );
  }

  get path() {
    return this.href;
  }

  /** @param {Response} response */
  processResponse(response) {
    if (!response.ok) {
      return undefined;
    }

    const mediaType = response.headers?.get("Content-Type");
    if (SiteMap.mediaTypeIsText(mediaType)) {
      return response.text();
    } else {
      const buffer = response.arrayBuffer();
      setParent(buffer, this);
      return buffer;
    }
  }

  get trailingSlashKeys() {
    return true;
  }

  get url() {
    return new URL(this.href);
  }
}
