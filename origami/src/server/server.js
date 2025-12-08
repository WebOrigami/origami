import { Tree, keysFromPath } from "@weborigami/async-tree";
import { formatError } from "@weborigami/language";
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
  const keys = keysFromUrl(url);

  const data = request.method === "POST" ? await parsePostData(request) : null;

  // Ask the tree for the resource with those keys.
  let resource;
  try {
    resource = await Tree.traverseOrThrow(map, ...keys);

    // If resource is a function, invoke to get the object we want to return.
    // For a POST request, pass the data to the function.
    if (typeof resource === "function") {
      resource = data ? await resource(data) : await resource();
    }

    // Construct the response.
    const constructed = await constructResponse(request, resource);
    if (!constructed) {
      return false;
    }

    // Copy the construct response to the ServerResponse and return true if
    // the response was valid.
    return copyResponse(constructed, response);
  } catch (/** @type {any} */ error) {
    // Display an error
    respondWithError(response, error);
    return true;
  }
}

function keysFromUrl(url) {
  const encodedKeys = keysFromPath(url.pathname);
  const keys = encodedKeys.map((key) => decodeURIComponent(key));

  // If the path ends with a trailing slash, the final key will be an empty
  // string. Change that to "index.html".
  if (keys.at(-1) === "") {
    keys[keys.length - 1] = "index.html";
  }

  return keys;
}

/**
 * A request listener for use with the node http.createServer and
 * https.createServer calls, letting you serve an async tree as a set of pages.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 * @param {Maplike} maplike
 */
export function requestListener(maplike) {
  const tree = Tree.from(maplike);
  return async function (request, response) {
    console.log(decodeURI(request.url));
    const handled = await handleRequest(request, response, tree);
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
  let message = formatError(error);
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
  response.writeHead(404, { "Content-Type": "text/html" });
  response.end(html, "utf-8");
  console.error(message);
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
