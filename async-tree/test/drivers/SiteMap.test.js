import assert from "node:assert";
import { beforeEach, describe, mock, test } from "node:test";
import SiteMap from "../../src/drivers/SiteMap.js";

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const mockHost = "https://mock";

const mockResponses = {
  "/about": {
    redirected: true,
    status: 301,
    url: "https://mock/about/",
  },
  "/about/Alice.html": {
    data: "Hello, Alice!",
  },
  "/about/Bob.html": {
    data: "Hello, Bob!",
  },
  "/about/Carol.html": {
    data: "Hello, Carol!",
  },
  "/index.html": {
    data: "Home page",
  },
};

describe("SiteMap", () => {
  beforeEach(() => {
    mock.method(global, "fetch", mockFetch);
  });

  test("returns an empty array as the keys of a tree", async () => {
    const fixture = new SiteMap(mockHost);
    const keys = [];
    for await (const key of fixture.keys()) {
      keys.push(key);
    }
    assert.deepEqual(keys, []);
  });

  test("can get a plain value for a key", async () => {
    const fixture = new SiteMap(mockHost);
    /** @type {any} */
    const arrayBuffer = await fixture.get("index.html");
    const text = textDecoder.decode(arrayBuffer);
    assert.equal(text, "Home page");
  });

  test("immediately return a new tree for a key with a trailing slash", async () => {
    const fixture = new SiteMap(mockHost);
    const about = await fixture.get("about/");
    assert(about instanceof SiteMap);
    assert.equal(about.href, "https://mock/about/");
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = new SiteMap(mockHost);
    assert.equal(await fixture.get("xyz"), undefined);
  });

  test("getting a null/undefined key throws an exception", async () => {
    const fixture = new SiteMap(mockHost);
    await assert.rejects(async () => {
      await fixture.get(null);
    });
    await assert.rejects(async () => {
      await fixture.get(undefined);
    });
  });
});

async function mockFetch(href) {
  if (!href.startsWith(mockHost)) {
    return { status: 404 };
  }
  const path = href.slice(mockHost.length);
  const mockedResponse = mockResponses[path];
  if (mockedResponse) {
    return Object.assign(
      {
        arrayBuffer: () => textEncoder.encode(mockedResponse.data).buffer,
        ok: true,
        status: 200,
        text: () => mockedResponse.data,
      },
      mockedResponse
    );
  }
  return {
    ok: false,
    status: 404,
  };
}
