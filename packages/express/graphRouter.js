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
