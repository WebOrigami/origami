import {
  inferMediaType,
  objectAtPath,
  textOrObject,
} from "../../express/graphRouter.js";

// Simple server for graph CLI.
export default function graphServer(graph) {
  return async function (request, response) {
    console.log(request.url);
    const obj = await objectAtPath(graph, request.url);
    if (obj) {
      const content = textOrObject(obj);
      const mediaType = inferMediaType(request.url, content);
      response.writeHead(200, { "Content-Type": mediaType });
      response.end(content, "utf-8");
    } else {
      response.writeHead(404, { "Content-Type": "text/html" });
      response.end(`Not found`, "utf-8");
    }
  };
}
