import {
  ObjectTree,
  Tree,
  keysFromPath,
  merge,
  trailingSlash,
} from "@weborigami/async-tree";
import { formatError } from "@weborigami/language";
import { ServerResponse } from "node:http";
import constructResponse from "./constructResponse.js";
import { debugTree, saveTrace } from "./debug.js";
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

// Extend the tree's scope with the URL's search parameters.
function extendTreeScopeWithParams(tree, url) {
  // Create a tree that includes the URL's search parameters.
  const params = {};
  for (const [key, value] of url.searchParams) {
    params[key] = value;
  }

  if (Object.keys(params).length === 0) {
    // No search parameters, so return the tree as is.
    return tree;
  }

  const paramTree = new ObjectTree({
    "@params": params,
  });

  // Create a new tree that's like the original one, but has the parameters in
  // its parent hierarchy.
  const extendedTree = Object.create(tree);
  const realParent = tree.parent;
  paramTree.parent = realParent;
  extendedTree.parent = paramTree;
  return extendedTree;
}

/**
 * Handle a client request.
 *
 * @param {import("node:http").IncomingMessage} request
 * @param {ServerResponse} response
 * @param {import("@weborigami/types").AsyncTree} tree
 */
export async function handleRequest(request, response, tree) {
  // For parsing purposes, we assume HTTPS -- it doesn't affect parsing.
  const url = new URL(request.url ?? "", `https://${request.headers.host}`);
  const keys = keysFromUrl(url);

  const extendedTree =
    url.searchParams && "parent" in tree
      ? extendTreeScopeWithParams(tree, url)
      : tree;

  const data = request.method === "POST" ? await parsePostData(request) : null;

  // Ask the tree for the resource with those keys.
  let resource;
  try {
    resource = await Tree.traverseOrThrow(extendedTree, ...keys);

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

    // TODO: Handle root path with no keys
    if (
      keys.length > 0 &&
      trailingSlash.remove(keys[0]) !== ".debug" &&
      trailingSlash.remove(keys[0]) !== ".trace"
    ) {
      // Save trace
      saveTrace(resource, keys);
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
  // Split on occurrences of `/!`, which represent Origami debug commands.
  // Command arguments can contain slashes; don't treat those as path keys.
  const parts = url.pathname.split(/\/!/);

  // Split everything before the first command by slashes and decode those.
  let path = parts.shift();
  if (parts.length > 0) {
    // HACK: Add back trailing slash that was removed by split
    path += "/";
  }
  const pathKeys = keysFromPath(path).map((key) => decodeURIComponent(key));
  if (parts.length > 0 && pathKeys.at(-1) === "") {
    // HACK part 2: Remove empty string that was added for trailing slash
    pathKeys.pop();
  }

  // If there are no commands, and the path ends with a trailing slash, the
  // final key will be an empty string. Change that to "index.html".
  if (parts.length === 0 && pathKeys[pathKeys.length - 1] === "") {
    pathKeys[pathKeys.length - 1] = "index.html";
  }

  // Decode the text of the commands, prefix spaces with a backslash, and add
  // back the `!` character.
  const commandKeys = parts.map(
    (command) => `!${decodeURIComponent(command).replace(/ /g, "\\ ")}`
  );

  const keys = [...pathKeys, ...commandKeys];
  return keys;
}

/**
 * A request listener for use with the node http.createServer and
 * https.createServer calls, letting you serve an async tree as a set of pages.
 *
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @param {Treelike} treelike
 */
export function requestListener(treelike) {
  const tree = Tree.from(treelike);
  const merged = merge(debugTree, tree); // tree has priority
  /** @type {any} */ (merged).pack = () => {
    return tree.get("index.html");
  };
  return async function (request, response) {
    console.log(decodeURI(request.url));
    const handled = await handleRequest(request, response, merged);
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
export function treeRouter(treelike) {
  const tree = Tree.from(treelike, { deep: true });
  // Return a router for the tree source.
  return async function (request, response, next) {
    const handled = await handleRequest(request, response, tree);
    if (!handled) {
      // Module not found, let next middleware function try.
      next();
    }
  };
}
