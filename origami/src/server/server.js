import { Dictionary, Graph, ObjectGraph } from "@graphorigami/core";
import Scope from "../common/Scope.js";
import * as serialize from "../common/serialize.js";
import {
  extname,
  graphInContext,
  isPlainObject,
  isStringLike,
} from "../common/utilities.js";
import { mediaTypeForExtension, mediaTypeIsText } from "./mediaTypes.js";

// Extend the graph's scope with the URL's search parameters.
function extendGraphScopeWithParams(graph, url) {
  // Create a graph that includes the URL's search parameters.
  const params = {};
  for (const [key, value] of url.searchParams) {
    params[key] = value;
  }

  if (Object.keys(params).length === 0) {
    // No search parameters, so return the graph as is.
    return graph;
  }

  const paramGraph = new ObjectGraph({
    "@params": params,
  });

  // Create a new scope that includes search parameter graph.
  const newScope = new Scope(paramGraph, graph.parent);

  // Create a new graph that extends the prototype chain of the supplied graph.
  const extendedGraph = graphInContext(graph, newScope);

  return extendedGraph;
}

// Asynchronous graph router as Express middleware.
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
  // For parsing purposes, we assume HTTPS -- it doesn't affect parsing.
  const url = new URL(request.url, `https://${request.headers.host}`);

  // We allow the use of %2F in paths as a way to insert a slash into a key, so
  // we parse the path into keys first, then decode them.
  const keys = Graph.keysFromPath(url.pathname).map((key) =>
    typeof key === "string" ? decodeURIComponent(key) : key
  );

  const extendedGraph =
    url.searchParams && "parent" in graph
      ? extendGraphScopeWithParams(graph, url)
      : graph;

  // Ask the graph for the resource with those keys.
  let resource;
  try {
    resource = await Graph.traverse(extendedGraph, ...keys);
    // If resource is a function, invoke to get the object we want to return.
    if (typeof resource === "function") {
      resource = await resource();
    }
  } catch (/** @type {any} */ error) {
    respondWithError(response, error);
    return true;
  }

  let mediaType;

  if (!resource) {
    return false;
  }

  // Determine media type, what data we'll send, and encoding.
  const extension = extname(url.pathname).toLowerCase();
  mediaType = extension ? mediaTypeForExtension[extension] : undefined;

  if (
    mediaType === undefined &&
    !request.url.endsWith("/") &&
    (Dictionary.isAsyncDictionary(resource) ||
      isPlainObject(resource) ||
      resource instanceof Array)
  ) {
    // Redirect to an index page for the result.
    // Redirect to the root of the graph.
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
    !isStringLike(resource)
  ) {
    const graph = Graph.from(resource);
    resource =
      mediaType === "text/yaml"
        ? await serialize.toYaml(graph)
        : await serialize.toJson(graph);
  } else if (
    mediaType === undefined &&
    (isPlainObject(resource) || resource instanceof Array)
  ) {
    // The resource is data, try showing it as YAML.
    const graph = Graph.from(resource);
    resource = await serialize.toYaml(graph);
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
      typeof data !== "string"
        ? "application/octet-stream"
        : data.trimStart().startsWith("<")
        ? "text/html"
        : "text/plain";
  }
  const encoding = mediaTypeIsText[mediaType] ? "utf-8" : undefined;

  // If we didn't get back some kind of data that response.write() accepts,
  // assume it was an error.
  const validResponse =
    typeof data === "string" ||
    data instanceof Buffer ||
    data instanceof Uint8Array;

  if (!validResponse) {
    const typeName = data.constructor?.name ?? typeof data;
    console.error(
      `A served graph must return a string, Buffer, or Uint8Array, but returned an instance of ${typeName}.`
    );
    return false;
  }

  response.writeHead(200, {
    "Content-Type": mediaType,
  });
  try {
    response.end(data, encoding);
  } catch (/** @type {any} */ error) {
    console.error(error.message);
    return false;
  }

  return true;
}

/**
 * A request listener for use with the node http.createServer and
 * https.createServer calls, letting you serve an async graph as a set of pages.
 *
 * @typedef {import("@graphorigami/core").Treelike} Graphable
 * @param {Graphable} graphable
 */
export function requestListener(graphable) {
  const graph = Graph.from(graphable);
  return async function (request, response) {
    console.log(decodeURI(request.url));
    const handled = await handleRequest(request, response, graph);
    if (!handled) {
      // Ignore exceptions that come up with sending a Not Found response.
      try {
        response.writeHead(404, { "Content-Type": "text/html" });
        response.end(`Not found`, "utf-8");
      } catch (error) {}
    }
  };
}

/**
 * Construct a page in response in the given error, and also show the error in
 * the console.
 */
function respondWithError(response, error) {
  let message = "";
  // Work up to the root cause, displaying intermediate messages as we go up.
  while (error.cause) {
    message += error.message + `\n`;
    error = error.cause;
  }
  if (error.name) {
    message += `${error.name}: `;
  }
  message += error.message;
  // Prevent HTML in the error message from being interpreted as HTML.
  message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<!DOCTYPE html>
<html>
<head>
<title>Error: ${error.message}</title>
</head>
<body>
<h1>Error</h1>
<pre><code>
${message}
</code></pre>
</body>
</html>
`;
  response.writeHead(404, { "Content-Type": "text/html" });
  response.end(html, "utf-8");
  console.error(message);
}

/**
 * Convert to a string if we can, but leave objects that convert to something
 * like "[object Object]" alone.
 *
 * @param {any} obj
 */
function textOrObject(obj) {
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
