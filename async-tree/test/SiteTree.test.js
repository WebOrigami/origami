import assert from "node:assert";
import { beforeEach, describe, mock, test } from "node:test";
import SiteTree from "../src/SiteTree.js";
import { Tree } from "../src/internal.js";

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const mockHost = "https://mock";

const mockResponses = {
  "/.keys.json": {
    data: JSON.stringify(["about/"]),
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
};

describe("SiteTree", () => {
  beforeEach(() => {
    mock.method(global, "fetch", mockFetch);
  });

  test("resolve() returns a new SiteTree for the given relative route", () => {
    const fixture = new SiteTree(mockHost);
    const about = fixture.resolve("about");
    assert.equal(about.href, "https://mock/about/");
  });

  test("can get the keys of the tree", async () => {
    const fixture = new SiteTree(mockHost);
    const about = fixture.resolve("about");
    const keys = await about.keys();
    assert.deepEqual(Array.from(keys), [
      "Alice.html",
      "Bob.html",
      "Carol.html",
    ]);
  });

  test("can get the value for a key", async () => {
    const fixture = new SiteTree(mockHost);
    const about = fixture.resolve("about");
    const arrayBuffer = await about.get("Alice.html");
    const text = textDecoder.decode(arrayBuffer);
    assert.equal(text, "Hello, Alice!");
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = new SiteTree(mockHost);
    assert.equal(await fixture.get("xyz"), undefined);
  });

  test("a redirect on a site with keys returns a SiteTree for the new URL", async () => {
    const fixture = new SiteTree(mockHost);
    const about = await fixture.get("about");
    assert.equal(about.href, "https://mock/about/");
  });

  test("can determine whether a key is for a subtree", async () => {
    const fixture = new SiteTree(mockHost);
    assert.equal(await fixture.isKeyForSubtree("about"), true);
    const about = fixture.resolve("about");
    assert.equal(await about.isKeyForSubtree("Alice.html"), false);
  });

  test("can convert a SiteGraph to a plain object", async () => {
    const fixture = new SiteTree(mockHost);
    // Convert buffers to strings.
    const strings = Tree.map(fixture, (value) => textDecoder.decode(value));
    assert.deepEqual(await Tree.plain(strings), {
      about: {
        "Alice.html": "Hello, Alice!",
        "Bob.html": "Hello, Bob!",
        "Carol.html": "Hello, Carol!",
      },
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
