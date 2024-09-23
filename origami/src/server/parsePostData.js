import { toString } from "@weborigami/async-tree";

export default async function parsePostData(request) {
  const data = await getPostData(request);
  const type = request.headers["content-type"];
  switch (type) {
    case "application/json":
      return JSON.parse(data);

    case "application/x-www-form-urlencoded":
      const params = new URLSearchParams(data);
      return Object.fromEntries(params);

    case "text/plain":
      return toString(data);

    default:
      return data;
  }
}

function getPostData(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      resolve(body);
    });
    request.on("error", (error) => {
      reject(error);
    });
  });
}
