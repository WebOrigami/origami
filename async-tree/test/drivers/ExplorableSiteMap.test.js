import assert from "node:assert";
import { beforeEach, describe, mock, test } from "node:test";
import AsyncMap from "../../src/drivers/AsyncMap.js";
import ExplorableSiteMap from "../../src/drivers/ExplorableSiteMap.js";
import { Tree } from "../../src/internal.js";
import * as trailingSlash from "../../src/trailingSlash.js";

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const mockHost = "https://mock";

const mockResponses = {
  "/.keys.json": {
    data: JSON.stringify(["about/", "index.html"]),
  },
  "/about": {
    redirected: true,
    status: 301,
    url: "https://mock/about/",
  },
  "/about/.keys.json": {
    data: JSON.stringify(["Alice.html", "Bob.html", "Carol.html"]),
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

describe("ExplorableSiteMap", () => {
  beforeEach(() => {
    mock.method(global, "fetch", mockFetch);
  });

  test("can get the keys of a tree", async () => {
    const fixture = new ExplorableSiteMap(mockHost);
    const keys = [];
    for await (const key of fixture.keys()) {
      keys.push(key);
    }
    assert.deepEqual(keys, ["about/", "index.html"]);
  });

  test("can get a plain value for a key", async () => {
    const fixture = new ExplorableSiteMap(mockHost);
    const arrayBuffer = await fixture.get("index.html");
    const text = textDecoder.decode(arrayBuffer);
    assert.equal(text, "Home page");
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = new ExplorableSiteMap(mockHost);
    assert.equal(await fixture.get("xyz"), undefined);
  });

  test("getting a null/undefined key throws an exception", async () => {
    const fixture = new ExplorableSiteMap(mockHost);
    await assert.rejects(async () => {
      await fixture.get(null);
    });
    await assert.rejects(async () => {
      await fixture.get(undefined);
    });
  });

  test("can return a new tree for a key that redirects", async () => {
    const fixture = new ExplorableSiteMap(mockHost);
    const about = await fixture.get("about");
    assert(about instanceof ExplorableSiteMap);
    assert.equal(about.href, "https://mock/about/");
  });

  test("can convert a site to a plain object", async () => {
    const fixture = new ExplorableSiteMap(mockHost);
    // Convert buffers to strings.
    const strings = await Tree.map(fixture, {
      deep: true,
      value: (value) => textDecoder.decode(value),
    });
    assert.deepEqual(await plain(strings), {
      about: {
        "Alice.html": "Hello, Alice!",
        "Bob.html": "Hello, Bob!",
        "Carol.html": "Hello, Carol!",
      },
      "index.html": "Home page",
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

async function plain(tree) {
  const result = {};
  for await (const [key, value] of tree.entries()) {
    const normalized = trailingSlash.remove(key);
    result[normalized] = value instanceof AsyncMap ? await plain(value) : value;
  }
  return result;
}
