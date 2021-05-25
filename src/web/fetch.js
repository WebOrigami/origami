import http from "http";
import https from "https";

// Define a simplistic version of fetch optimized for ExplorableSite.
//
// We could use a library like node-fetch, but ExplorableSite's needs are
// perhaps basic enough that we can roll our own fetch and avoid a dependency.
export default async function fetch(href) {
  const url = new URL(href);
  const protocol = url.protocol === "http:" ? http : https;

  const promise = new Promise((resolve, reject) => {
    const request = protocol.get(url, (response) => {
      const { statusCode } = response;
      if (
        statusCode === undefined ||
        !(statusCode >= 200 && statusCode < 300)
      ) {
        // Not Found or some other unexpected response.
        resolve(undefined);
        return;
      }

      // Read and return response data as a Buffer.
      const chunks = [];
      response.on("data", (chunk) => {
        chunks.push(chunk);
      });
      response.on("end", () => {
        const buffer = Buffer.concat([...chunks]);
        resolve(buffer);
      });
    });
    request.on("error", (error) => {
      reject(error);
    });
    request.end();
  });

  return promise;
}
