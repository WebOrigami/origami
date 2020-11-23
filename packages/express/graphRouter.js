import path from "path";

// Graph router as Express middleware.
export default function graphRouter(graph) {
  // Return a router for the graph source.
  return async function (request, response, next) {
    const obj = await objectAtPath(graph, request.path);
    if (obj) {
      // Respond with content.
      const content = textOrObject(obj);
      const contentType = inferMediaType(request.path, content);
      response.status(200);
      response.set("Content-Type", contentType);
      response.send(content);
    } else {
      // Module not found, let next middleware function try.
      next();
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
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".wav": "audio/wav",
    ".mp4": "video/mp4",
    ".woff": "application/font-woff",
    ".ttf": "application/font-ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".otf": "application/font-otf",
    ".wasm": "application/wasm",
  };
  const mediaType = mediaTypes[extname] || defaultMediaType;
  return mediaType;
}

// Given a path like "/foo/bar", return the corresponding object in the graph.
export async function objectAtPath(graph, objectPath) {
  const keys = objectPath.split("/");
  if (keys[0] === "") {
    // The path begins with a slash; drop that part.
    keys.shift();
  }
  if (keys[keys.length - 1] === "") {
    // The path ends with a slash; replace that with index.html as the default key.
    keys.pop();
    keys.push("index.html");
  }
  return await graph.traverse(keys);
}
