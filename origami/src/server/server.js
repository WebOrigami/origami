import {
  keysFromPath,
  trailingSlash,
  TraverseError,
  Tree,
} from "@weborigami/async-tree";
import { formatError, systemCache, SystemCacheMap } from "@weborigami/language";
import { ServerResponse } from "node:http";
import constructResponse from "./constructResponse.js";
import parsePostData from "./parsePostData.js";

/**
 * Copy a constructed response to a ServerResponse. Return true if the response
 * was successfully copied, and false if there was a problem.
 *
 * @param {Response} constructed
 * @param {ServerResponse} response
 */
async function copyResponse(constructed, response) {
  response.statusCode = constructed.status;
  response.statusMessage = constructed.statusText;

  // @ts-ignore Headers has an iterator in ES2022 but tsc doesn't know that.
  for (const [key, value] of constructed.headers) {
    response.setHeader(key, value);
  }

  if (constructed.body) {
    try {
      // Write the response body to the ServerResponse.
      const reader = constructed.body.getReader();
      let { done, value } = await reader.read();
      while (!done) {
        response.write(value);
        ({ done, value } = await reader.read());
      }
      response.end();
    } catch (/** @type {any} */ error) {
      console.error(error.message);
      return false;
    }
  }

  return true;
}

/**
 * Handle a client request.
 *
 * @param {import("node:http").IncomingMessage} request
 * @param {ServerResponse} response
 * @param {import("@weborigami/async-tree").SyncOrAsyncMap} map
 */
export async function handleRequest(request, response, map) {
  // For parsing purposes, we assume HTTPS -- it doesn't affect parsing.
  const url = new URL(request.url ?? "", `https://${request.headers.host}`);

  // Do we already have an ETag for this resource?
  const pathname = url.pathname.slice(1);
  const etagPath = SystemCacheMap.joinPath("_etag", pathname);
  const etag = systemCache.get(etagPath)?.value;
  if (etag) {
    // Does the client already have this version?
    const ifNoneMatch = request?.headers?.["if-none-match"];
    if (ifNoneMatch === etag) {
      // Client already has this version
      response.writeHead(304, {
        "Cache-Control": "no-cache",
        ETag: etag,
      });
      response.end();
      return true;
    }
  }

  const keys = keysFromUrl(url);
  const data = request.method === "POST" ? await parsePostData(request) : null;

  // Ask the tree for the resource with those keys.
  let resource;
  try {
    // Track whether or not the resource was successfully found and a response
    // was sent so that we know whether or not to send a 404.
    let success;
    let undefinedETag = false;

    // We wrap the tree traversal in a call that will both set the etag for this
    // resource and copy the constructed response to the ServerResponse. The
    // etag is already included in the response headers so we don't need to
    // receive it here.
    await systemCache.getOrInsertComputedAsync(etagPath, async () => {
      resource = await Tree.traverseOrThrow(map, ...keys);

      // If resource is a function, invoke to get the object we want to return.
      // For a POST request, pass the data to the function.
      if (typeof resource === "function") {
        resource = data ? await resource(data) : await resource();
      }

      if (resource == null) {
        return;
      }

      // Construct the response
      const { response: constructed, etag } = await constructResponse(
        request,
        resource,
      );

      if (!etag) {
        undefinedETag = true;
      }

      // Copy the construct response to the ServerResponse and remember whether
      // it was successful.
      success = await copyResponse(constructed, response);

      return etag;
    });

    // HACK: don't store undefined etag
    if (undefinedETag) {
      systemCache.delete(etagPath);
    }

    // Now return whether or not we successfully found the resource
    return success;
  } catch (/** @type {any} */ error) {
    // Display an error
    await respondWithError(response, error);
    return true;
  }
}

export function keysFromUrl(url) {
  const encodedKeys = keysFromPath(url.pathname);
  // Decode the keys, but stop decoding if we encounter an Origami debugger command
  let foundCommand = false;
  const keys = encodedKeys.map((key) => {
    if (key.startsWith("!")) {
      foundCommand = true;
    }
    return foundCommand ? key : decodeURIComponent(key);
  });

  // If the keys array is empty (the path was just a trailing slash) or if the
  // path ended with a slash, add "index.html" to the end of the keys.
  if (keys.length === 0 || trailingSlash.has(keys.at(-1))) {
    keys.push("index.html");
  }

  return keys;
}

/**
 * A request listener for use with the node http.createServer and
 * https.createServer calls, letting you serve an async tree as a set of pages.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 * @param {object} options
 * @param {boolean} [options.quiet] If true, suppresses logging of incoming requests.
 * @param {Maplike} maplike
 */
export function requestListener(maplike, options = {}) {
  const quiet = options.quiet ?? false;
  const tree = Tree.from(maplike);
  return async function (request, response) {
    if (!quiet) {
      console.log(decodeURI(request.url));
    }
    const handled = await handleRequest(request, response, tree);
    if (!handled) {
      // Not found, return a 404.
      response.statusCode = 404;
      response.statusMessage = "Not Found";
      response.end("Not Found", "utf-8");
    }
  };
}

/**
 * Construct a page in response in the given error, and also show the error in
 * the console.
 */
export async function respondWithError(response, error) {
  let message = await formatError(error);
  // Remove ANSI escape codes from the message.
  message = message.replace(/\x1b\[[0-9;]*m/g, "");
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
  response.writeHead(500, {
    "Content-Type": "text/html",
    "x-error-details": encodeURIComponent(message),
  });
  response.end(html, "utf-8");

  // Don't log traverse errors for requests like favicon.ico, com.chrome.devtools.json, etc.
  if (!(error instanceof TraverseError)) {
    console.error(message);
  }
}

// Asynchronous tree router as Express middleware.
export function treeRouter(maplike) {
  const tree = Tree.from(maplike, { deep: true });
  // Return a router for the tree source.
  return async function (request, response, next) {
    const handled = await handleRequest(request, response, tree);
    if (!handled) {
      // Module not found, let next middleware function try.
      next();
    }
  };
}
