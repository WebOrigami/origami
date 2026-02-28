import { extension, isPacked, toString, Tree } from "@weborigami/async-tree";
import { computedMIMEType } from "whatwg-mimetype";
import { mediaTypeForExtension } from "./mediaTypes.js";

/**
 * Given a resource that was returned from a route, construct an appropriate
 * HTTP Response indicating what should be sent to the client.
 *
 * @param {import("node:http").IncomingMessage} request
 * @param {any} resource
 * @returns {Promise<Response>}
 */
export default async function constructResponse(request, resource) {
  if (resource instanceof Response) {
    // Already a Response, return as is.
    return resource;
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

  let body = resource;
  if (!isPacked(resource)) {
    // Can we treat it as text?
    const text = toString(resource);
    if (text) {
      body = text;
    }
  }

  // Determine MIME type
  let mediaType;
  if (resource.mediaType) {
    // Resource indicates its own media type.
    mediaType = resource.mediaType;
  } else {
    // Do we know the media type based on the URL extension?
    const ext = extension.extname(url.pathname).toLowerCase();
    const extensionMediaType = ext ? mediaTypeForExtension[ext] : undefined;
    if (extensionMediaType) {
      mediaType = extensionMediaType;
    } else {
      // Use MIME Sniffing Standard to determine media type
      const isString = typeof body === "string" || body instanceof String;
      const bytes = isString ? new TextEncoder().encode(String(body)) : body;
      let sniffedType;
      try {
        sniffedType = computedMIMEType(bytes);
      } catch (error) {
        // Ignore sniffing errors
      }
      if (sniffedType) {
        if (isString && sniffedType.essence === "application/octet-stream") {
          // Prefer text/plain for strings
          mediaType = "text/plain";
        } else {
          mediaType = sniffedType.toString();
        }
      }
    }
  }

  // If we didn't get back some kind of data that response.write() accepts,
  // assume it was an error.
  const validResponse = isPacked(body);
  if (!validResponse) {
    const typeName = body?.constructor?.name ?? typeof body;
    throw new Error(
      `A served tree must return a string or a TypedArray but returned an instance of ${typeName}.`,
    );
  }

  const options = mediaType ? { headers: { "Content-Type": mediaType } } : {};
  const response = new Response(body, options);
  return response;
}
