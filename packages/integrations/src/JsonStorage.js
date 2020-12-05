import {
  AsyncExplorable,
  asyncGet,
  asyncKeys,
  asyncOps,
  asyncSet,
  explorablePlainObject,
} from "@explorablegraph/core";
import https from "https";
// import http from "http";
import fetch from "node-fetch";

const sampleId = "8277d653-77cc-49be-bdec-f433a4e17ac9";
let fetchPromise;

export default class JsonStorage extends AsyncExplorable {
  constructor(id) {
    super();
    this.id = id || sampleId;
    this.url = `https://jsonstorage.net/api/items/${this.id}`;
  }

  async [asyncGet](...keys) {
    const obj = await this.fetch(this.url);
    return await obj[asyncGet](...keys);
  }

  async *[asyncKeys]() {
    const obj = await this.fetch(this.url);
    yield* obj[asyncKeys]();
  }

  // REVIEW: This currently doesn't match the [set] pattern.
  // What's the best way to update a storage object like this?
  async [asyncSet](arg) {
    // const obj = await this.fetch(this.url);
    // await asyncOps.update(obj, arg);
    const strings = await asyncOps.strings(arg);
    await this.put(strings);
  }

  async fetch() {
    if (fetchPromise === undefined) {
      fetchPromise = new Promise(async (resolve) => {
        const response = await fetch(this.url);
        const text = await response.text();
        const obj = JSON.parse(text);
        const explorable = new explorablePlainObject(obj);
        resolve(explorable);
      });
    }
    return fetchPromise;
  }

  async put(obj) {
    const { host, port, protocol, pathname: path } = new URL(this.url);

    const data = JSON.stringify(obj, null, 2);
    const headers = {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    };

    const options = {
      headers,
      host,
      method: "PUT",
      path,
      port: port || 443,
      // protocol: "http:",
      protocol,
    };

    const promise = new Promise((resolve) => {
      // const request = http.request(options, function (response) {
      const request = https.request(options, function (response) {
        // console.log("STATUS: " + response.statusCode);
        // console.log("HEADERS: " + JSON.stringify(response.headers));
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          // console.log("BODY: " + chunk);
          resolve(chunk);
        });
      });

      request.on("error", (error) => {
        throw error;
      });

      request.write(data);
      request.end();
    });

    return promise;
  }
}

// const s = new JsonStorage();
// // s.put({ hello: "world", a: 1, b: 2, c: 3 });
// await s[asyncSet](new explorablePlainObject({ a: 1, message: "Hello", b: 2 }));
