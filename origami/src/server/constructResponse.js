import {
  SiteTree,
  Tree,
  isPacked,
  isPlainObject,
  isStringLike,
} from "@weborigami/async-tree";
import { extname } from "@weborigami/language";
import * as serialize from "../common/serialize.js";
import { toString } from "../common/utilities.js";
import { mediaTypeForExtension } from "./mediaTypes.js";

const TypedArray = Object.getPrototypeOf(Uint8Array);

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
  const url = new URL(request.url ?? "", `https://${request.headers.host}`);

  let mediaType;
  if (resource.mediaType) {
    // Resource indicates its own media type.
    mediaType = resource.mediaType;
  } else {
    // Infer expected media type from file extension on request URL.
    const extension = extname(url.pathname).toLowerCase();
    mediaType = extension ? mediaTypeForExtension[extension] : undefined;
  }

  if (!url.pathname.endsWith("/") && Tree.isTreelike(resource)) {
    // Treelike resource: redirect to its index page.
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
  }

  if (
    (mediaType === "application/json" || mediaType === "text/yaml") &&
    !isStringLike(resource)
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

  let body;
  if (mediaType) {
    body = SiteTree.mediaTypeIsText(mediaType) ? toString(resource) : resource;
  } else {
    body = textOrObject(resource);
    // Infer media type.
    mediaType =
      typeof body !== "string"
        ? "application/octet-stream"
        : body.trimStart().startsWith("<")
        ? "text/html"
        : "text/plain";
  }

  // Assume text is encoded in UTF-8.
  if (SiteTree.mediaTypeIsText(mediaType)) {
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

  return new Response(body, {
    headers: {
      "Content-Type": mediaType,
    },
  });
}

/**
 * Convert to a string if we can, but leave objects that convert to something
 * like "[object Object]" alone.
 *
 * @param {any} object
 */
function textOrObject(object) {
  if (object instanceof ArrayBuffer) {
    // Convert to Uint8Array so we can write it to the Response.
    return new Uint8Array(object);
  } else if (object instanceof TypedArray) {
    // Return typed arrays as is.
    return object;
  }
  return toString(object);
}
