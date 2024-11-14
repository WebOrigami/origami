import assert from "node:assert";
import { beforeEach, describe, mock, test } from "node:test";
import SiteTree from "../../src/drivers/SiteTree.js";

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

describe("SiteTree", () => {
  beforeEach(() => {
    mock.method(global, "fetch", mockFetch);
  });

  test("returns an empty array as the keys of a tree", async () => {
    const fixture = new SiteTree(mockHost);
    const keys = await fixture.keys();
    assert.deepEqual(Array.from(keys), []);
  });

  test("can get a plain value for a key", async () => {
    const fixture = new SiteTree(mockHost);
    const arrayBuffer = await fixture.get("index.html");
    const text = textDecoder.decode(arrayBuffer);
    assert.equal(text, "Home page");
  });

  test("immediately return a new tree for a key with a trailing slash", async () => {
    const fixture = new SiteTree(mockHost);
    const about = await fixture.get("about/");
    assert(about instanceof SiteTree);
    assert.equal(about.href, "https://mock/about/");
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = new SiteTree(mockHost);
    assert.equal(await fixture.get("xyz"), undefined);
  });

  test("getting a null/undefined key throws an exception", async () => {
    const fixture = new SiteTree(mockHost);
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
