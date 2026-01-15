import {
  extension,
  isPacked,
  isPlainObject,
  isStringlike,
  SiteMap,
  toString,
  Tree,
} from "@weborigami/async-tree";
import * as serialize from "../common/serialize.js";
import { mediaTypeForExtension } from "./mediaTypes.js";

/**
 * Given a resource that was returned from a route, construct an appropriate
 * HTTP Response indicating what should be sent to the client. Return null
 * if the resource is not a valid response.
 *
 * @param {import("node:http").IncomingMessage} request
 * @param {any} resource
 * @returns {Promise<Response|null>}
 */
export default async function constructResponse(request, resource) {
  if (resource instanceof Response) {
    // Already a Response, return as is.
    return resource;
  } else if (resource == null) {
    return null;
  }

  // Determine media type, what data we'll send, and encoding.
  const url = new URL(request?.url ?? "", `https://${request?.headers.host}`);

  if (!url.pathname.endsWith("/") && Tree.isMaplike(resource)) {
    // Maplike resource: redirect to its index page.
    const Location = `${url.pathname}/`;
    return new Response("ok", {
      headers: {
        Location,
      },
      status: 307,
    });
  }

  if (!isPacked(resource) && typeof resource.pack === "function") {
    resource = await resource.pack();
    if (typeof resource === "function") {
      resource = await resource();
    }
    if (resource instanceof Response) {
      return resource;
    }
  }

  let mediaType;
  if (resource.mediaType) {
    // Resource indicates its own media type.
    mediaType = resource.mediaType;
  } else {
    // Infer expected media type from file extension on request URL.
    const ext = extension.extname(url.pathname).toLowerCase();
    mediaType = ext ? mediaTypeForExtension[ext] : undefined;
  }

  if (
    (mediaType === "application/json" || mediaType === "text/yaml") &&
    !isStringlike(resource)
  ) {
    // The request is for a JSON or YAML result, and the resource we got isn't
    // yet a string: convert the resource to JSON or YAML now.
    const tree = Tree.from(resource);
    resource =
      mediaType === "text/yaml"
        ? await serialize.toYaml(tree)
        : await serialize.toJson(tree);
  } else if (
    mediaType === undefined &&
    (isPlainObject(resource) || resource instanceof Array)
  ) {
    // The resource is data, try showing it as YAML.
    const tree = Tree.from(resource);
    resource = await serialize.toYaml(tree);
    mediaType = "text/yaml";
  }

  // By default, the body will be the resource we got
  let body = resource;
  if (!mediaType) {
    // Maybe it's HTML?
    const text = toString(resource);
    if (text) {
      mediaType = maybeHtml(text) ? "text/html" : "text/plain";
      mediaType += "; charset=utf-8";
      body = text;
    }
  } else if (mediaType && SiteMap.mediaTypeIsText(mediaType)) {
    // Assume text is encoded in UTF-8.
    body = toString(resource);
    mediaType += "; charset=utf-8";
  }

  // If we didn't get back some kind of data that response.write() accepts,
  // assume it was an error.
  const validResponse = isPacked(body);
  if (!validResponse) {
    const typeName = body?.constructor?.name ?? typeof body;
    console.error(
      `A served tree must return a string or a TypedArray but returned an instance of ${typeName}.`
    );
    return null;
  }

  const options = mediaType ? { headers: { "Content-Type": mediaType } } : {};
  const response = new Response(body, options);
  return response;
}

// Return true if the resource appears to represent HTML
function maybeHtml(text) {
  if (!text) {
    return false;
  }
  if (text.startsWith("<!DOCTYPE html>")) {
    return true;
  }
  if (text.startsWith("<!--")) {
    return true;
  }
  // Check if the text starts with an HTML tag.
  // - start with possible whitespace
  // - followed by '<'
  // - followed by a letter
  // - followed maybe by letters, digits, hyphens, underscores, colons, or periods
  // - followed by '>', or
  // - followed by whitespace, anything that's not '>', then a '>'
  const tagRegex = /^\s*<[a-zA-Z][a-zA-Z0-9-_:\.]*(>|[\s]+[^>]*>)/;
  return tagRegex.test(text);
}
