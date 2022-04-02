import path from "path";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { isPlainObject } from "../core/utilities.js";
import { mediaTypeForExtension, mediaTypeIsText } from "./mediaTypes.js";

// Given a relative web path like "/foo/bar", return the corresponding object in
// the graph.
export async function getResourceAtPath(graph, href) {
  const keys = keysFromHref(href);
  return await ExplorableGraph.traverse(graph, ...keys);
}

// Explorable graph router as Express middleware.
export function graphRouter(graph) {
  // Return a router for the graph source.
  return async function (request, response, next) {
    const handled = await handleRequest(request, response, graph);
    if (!handled) {
      // Module not found, let next middleware function try.
      next();
    }
  };
}

export async function handleRequest(request, response, graph) {
  const decodedUrl = decodeURI(request.url);
  const keys = keysFromHref(decodedUrl);

  // Ask the graph for the resource with those keys.
  let resource;
  try {
    resource = await ExplorableGraph.traverse(graph, ...keys);
    // If resource is a function, invoke to get the object we want to return.
    if (typeof resource === "function") {
      resource = await resource();
    }
  } catch (/** @type {any} */ error) {
    console.log(error.message);
    resource = undefined;
  }

  let mediaType;
  if (resource != undefined) {
    // Determine media type, what data we'll send, and encoding.
    const extname = path.extname(request.url).toLowerCase();
    mediaType = extname ? mediaTypeForExtension[extname] : undefined;

    if (
      mediaType === undefined &&
      !request.url.endsWith("/") &&
      (ExplorableGraph.isExplorable(resource) ||
        isPlainObject(resource) ||
        resource instanceof Array)
    ) {
      // Redirect to an index page for the result.
      // Redirect to the root of the explorable graph.
      const Location = `${request.url}/`;
      response.writeHead(307, { Location });
      response.end("ok");
      return true;
    }

    if (resource instanceof ArrayBuffer) {
      // Convert JavaScript ArrayBuffer to Node Buffer.
      resource = Buffer.from(resource);
    }

    // If the request is for a JSON or YAML result, and the resource we got
    // isn't yet a string or Buffer, convert the resource to JSON or YAML now.
    if (
      (mediaType === "application/json" || mediaType === "text/yaml") &&
      !(typeof resource === "string" || resource instanceof Buffer)
    ) {
      const graph = ExplorableGraph.from(resource);
      resource =
        mediaType === "text/yaml"
          ? await ExplorableGraph.toYaml(graph)
          : await ExplorableGraph.toJson(graph);
    } else if (
      mediaType === undefined &&
      (isPlainObject(resource) || resource instanceof Array)
    ) {
      // The resource is data, try showing it as YAML.
      const graph = ExplorableGraph.from(resource);
      resource = await ExplorableGraph.toYaml(graph);
      mediaType = "text/yaml";
    }

    let data;
    if (mediaType) {
      data = mediaTypeIsText[mediaType] ? String(resource) : resource;
    } else {
      data = textOrObject(resource);
    }

    if (!mediaType) {
      // Can't identify media type; infer default type.
      mediaType =
        typeof data === "string" ? "text/html" : "application/octet-stream";
    }
    const encoding = mediaTypeIsText[mediaType] ? "utf-8" : undefined;

    response.writeHead(200, {
      "Content-Type": mediaType,
    });
    response.end(data, encoding);

    return true;
  }
  return false;
}

export function keysFromHref(href) {
  const keys = href.split("/");
  if (keys[0] === "") {
    // The path begins with a slash; drop that part.
    keys.shift();
  }
  if (keys[keys.length - 1] === "") {
    // The path ends with a slash; replace that with index.html as the default key.
    keys.pop();
    keys.push("index.html");
  }
  return keys;
}

/**
 * A request listener for use with the node http.createServer and
 * https.createServer calls, letting you serve an explorable function as a set
 * of pages.
 *
 * @param {GraphVariant} variant
 */
export function requestListener(variant) {
  const graph = ExplorableGraph.from(variant);
  return async function (request, response) {
    console.log(decodeURI(request.url));
    const handled = await handleRequest(request, response, graph);
    if (!handled) {
      response.writeHead(404, { "Content-Type": "text/html" });
      response.end(`Not found`, "utf-8");
    }
  };
}

/**
 * Convert to a string if we can, but leave objects that convert to something
 * like "[object Object]" alone.
 *
 * @param {any} obj
 */
export function textOrObject(obj) {
  if (typeof obj === "string") {
    // Return string as is.
    return obj;
  }

  // See if we can convert the object to a string.
  const text = String(obj);

  // See if we ended up with a default string.
  const constructor = obj.constructor;
  const name = constructor.name || "Object";
  if (text === `[object Object]` || text === `[object ${name}]`) {
    // Got a default string, so probably not what we wanted.
    // Return original object.
    return obj;
  } else {
    // We appear to have cast the object to a string; return that.
    return text;
  }
}
