import https from "https";
// import http from "http";
import fetch from "node-fetch";
import { ExplorableGraph } from "../../core/exports.js";

const sampleId = "8277d653-77cc-49be-bdec-f433a4e17ac9";
let fetchPromise;

export default class JsonStorage extends ExplorableGraph {
  constructor(id) {
    super();
    this.id = id || sampleId;
    this.url = `https://jsonstorage.net/api/items/${this.id}`;
  }

  async *[Symbol.asyncIterator]() {
    const obj = await this.fetch(this.url);
    yield* obj[Symbol.asyncIterator]();
  }

  async get(...keys) {
    const obj = await this.fetch(this.url);
    return await obj.get(...keys);
  }

  // TODO: Add routing via ...keys to match general set pattern.
  async set(arg) {
    const strings = await arg.strings();
    await this.put(strings);
  }

  async fetch() {
    if (fetchPromise === undefined) {
      fetchPromise = new Promise(async (resolve) => {
        const response = await fetch(this.url);
        const text = await response.text();
        const obj = JSON.parse(text);
        const explorable = new ExplorableObject(obj);
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
