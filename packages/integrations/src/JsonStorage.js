import {
  AsyncExplorable,
  asyncGet,
  asyncKeys,
  asyncOps,
  explorablePlainObject,
} from "@explorablegraph/core";
import fetch from "node-fetch";

const sampleId = "8277d653-77cc-49be-bdec-f433a4e17ac9";
let loadPromise;

export default class JsonStorage extends AsyncExplorable {
  constructor(id) {
    super();
    this.id = id || sampleId;
    this.url = `https://jsonstorage.net/api/items/${this.id}`;
  }

  async [asyncGet](...keys) {
    const obj = await load(this.url);
    return await obj[asyncGet](...keys);
  }

  async *[asyncKeys]() {
    const obj = await load(this.url);
    const keys = await asyncOps.keys(obj);
    yield* obj[asyncKeys]();
  }

  // async [asyncSet](...args) {}
}

function load(url) {
  if (loadPromise === undefined) {
    loadPromise = new Promise(async (resolve) => {
      const response = await fetch(url);
      const text = await response.text();
      const obj = JSON.parse(text);
      const explorable = new explorablePlainObject(obj);
      resolve(explorable);
    });
  }
  return loadPromise;
}
