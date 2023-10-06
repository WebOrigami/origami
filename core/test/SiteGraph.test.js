import assert from "node:assert";
import { beforeEach, describe, mock, test } from "node:test";
import SiteGraph from "../src/SiteGraph.js";

const mockHost = "https://mock";

const mockResponses = {
  "/.keys.json": {
    data: JSON.stringify(["Alice.html", "Bob.html", "Carol.html"]),
  },
  "/Alice.html": {
    data: "Hello, Alice!",
  },
  "/about": {
    redirected: true,
    status: 301,
    url: "https://mock/about/",
  },
};

describe("SiteGraph", () => {
  beforeEach(() => {
    mock.method(global, "fetch", mockFetch);
  });

  test("can get the keys of the graph", async () => {
    const fixture = new SiteGraph(mockHost);
    const keys = await fixture.keys();
    assert.deepEqual([...keys], ["Alice.html", "Bob.html", "Carol.html"]);
  });

  test("can get the value for a key", async () => {
    const fixture = new SiteGraph(mockHost);
    const alice = await fixture.get("Alice.html");
    assert.equal(alice, "Hello, Alice!");
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = new SiteGraph(mockHost);
    assert.equal(await fixture.get("xyz"), undefined);
  });

  test("a redirect on a site with keys returns a SiteGraph for the new URL", async () => {
    const fixture = new SiteGraph(mockHost);
    const about = await fixture.get("about");
    assert.equal(about.href, "https://mock/about/");
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
        // Returns a Buffer, not an ArrayBuffer
        arrayBuffer: () => Buffer.from(mockedResponse.data),
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
