import assert from "node:assert";
import { describe, test } from "node:test";
import * as cachedResponse from "../../src/server/cachedResponse.js";

describe("cachedResponse", () => {
  test("returns a cachable structure for a Response", async () => {
    const original = new Response("hello", {
      headers: {
        "Content-Type": "text/plain",
        "X-Test": "yes",
      },
      status: 201,
      statusText: "Created",
    });

    const cached = await cachedResponse.cachedFromResponse(original);

    assert.equal(await new Response(cached.body).text(), "hello");
    assert.deepEqual(cached.headers, {
      "content-type": "text/plain",
      "x-test": "yes",
    });
    assert.equal(cached.status, 201);
    assert.equal(cached.statusText, "Created");
    assert(original.bodyUsed);
  });

  test("can copy of a cached structure into multiple Response objects", async () => {
    const original = new Response("hello", {
      headers: {
        "Content-Type": "text/plain",
        "X-Test": "yes",
      },
      status: 201,
      statusText: "Created",
    });
    const cached = await cachedResponse.cachedFromResponse(original);

    const copiedResponses = [];
    for (let index = 0; index < 2; index++) {
      const headers = new Map();
      let body = new Uint8Array();
      const response = /** @type {any} */ ({
        setHeader(key, value) {
          headers.set(key, value);
        },
        end(value) {
          body = value;
        },
      });

      cachedResponse.copyToResponse(cached, response);
      copiedResponses.push({ body, headers, response });
    }

    for (const { body, headers, response } of copiedResponses) {
      assert.deepEqual(
        Array.from(body),
        Array.from(new TextEncoder().encode("hello")),
      );
      assert.equal(headers.get("content-type"), "text/plain");
      assert.equal(headers.get("x-test"), "yes");
      assert.equal(response.statusCode, 201);
      assert.equal(response.statusMessage, "Created");
    }
  });
});
