// A simplistic version of fetch optimized for ExplorableSite.
// We could use a library like node-fetch, but ExplorableSite's needs are basic
// enough that we can roll our own fetch and avoid a dependency.
async function simpleFetch(href) {
  const url = new URL(href);
  const protocolModule = url.protocol === "http:" ? "http" : "https";
  const protocol = await import(protocolModule);

  const promise = new Promise((resolve, reject) => {
    const request = protocol.get(url, (response) => {
      const { statusCode } = response;
      if (
        statusCode === undefined ||
        !(statusCode >= 200 && statusCode < 300)
      ) {
        // Not Found or some other unexpected response.
        const response = new SimpleResponse(undefined, statusCode);
        resolve(response);
        return;
      }

      // Read and return response data as a Buffer.
      const chunks = [];
      response.on("data", (chunk) => {
        chunks.push(chunk);
      });
      response.on("end", () => {
        const buffer = Buffer.concat([...chunks]);
        const response = new SimpleResponse(buffer, statusCode);
        resolve(response);
      });
    });
    request.on("error", (error) => {
      reject(error);
    });
    request.end();
  });

  return promise;
}

// Roughly approximates a browser's fetch Response
class SimpleResponse {
  #buffer;
  #status;

  constructor(buffer, status) {
    this.#buffer = buffer;
    this.#status = status;
  }

  async arrayBuffer() {
    return this.#buffer;
  }

  get ok() {
    return this.#status >= 200 && this.#status < 300;
  }

  get status() {
    return this.#status;
  }

  async text() {
    // From https://stackoverflow.com/a/11411402/76472
    return new TextDecoder().decode(this.#buffer);
  }
}

const fetch = globalThis.fetch ?? simpleFetch;
export default fetch;
