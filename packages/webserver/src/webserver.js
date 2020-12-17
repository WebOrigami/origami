import { AsyncExplorable } from "@explorablegraph/core";
import { asyncGet } from "@explorablegraph/symbols";
import path from "path";

/**
 * Given an object's path and the object itself, infer an appropriate media
 * (MIME) type.
 *
 * @param {string} url
 * @param {any} content
 * @returns {string}
 */
export function inferMediaType(url, content) {
  const defaultMediaType =
    typeof content === "string" ? "text/html" : "application/octet-stream";
  const extname = path.extname(url).toLowerCase();
  const mediaTypes = {
    ".css": "text/css",
    ".eot": "application/vnd.ms-fontobject",
    ".gif": "image/gif",
    ".html": "text/html",
    ".jpeg": "image/jpg",
    ".jpg": "image/jpg",
    ".js": "text/javascript",
    ".json": "application/json",
    ".mp4": "video/mp4",
    ".otf": "application/font-otf",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ttf": "application/font-ttf",
    ".wasm": "application/wasm",
    ".wav": "audio/wav",
    ".woff": "application/font-woff",
  };
  const mediaType = mediaTypes[extname] || defaultMediaType;
  return mediaType;
}

// Given a relative web path like "/foo/bar", return the corresponding object in
// the graph.
export async function getResourceAtPath(exfn, href) {
  const keys = keysFromHref(href);
  return await exfn[asyncGet](...keys);
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
 * @param {any} arg
 */
export function requestListener(arg) {
  // Cast string/JSON arguments to objects.
  let obj;
  if (typeof arg === "string" && arg.startsWith("{")) {
    // Interpret as JSON
    obj = JSON.parse(arg);
  } else if (typeof arg === "string") {
    // Serve single string
    obj = { "index.html": arg };
  } else {
    obj = arg;
  }

  const resources = AsyncExplorable(obj);

  return async function (request, response) {
    console.log(request.url);
    const unescaped = unescape(request.url);
    const keys = keysFromHref(unescaped);
    const resource = await resources[asyncGet](...keys);
    if (resource) {
      // If resource is a function, invoke to get the object we want to return.
      const obj = typeof resource === "function" ? resource() : resource;
      const content = textOrObject(obj);
      const mediaType = inferMediaType(request.url, content);
      response.writeHead(200, {
        "Content-Type": mediaType,
      });
      response.end(content, "utf-8");
    } else {
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
    // Return string object as is.
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
