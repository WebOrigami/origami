import { syncOps } from "@explorablegraph/exfn";
import chai from "chai";
import parse from "../src/parse.js";
const { assert } = chai;

describe("parse", () => {
  it("recognizes text as text", () => {
    const parsed = parse("hello");
    assert.deepEqual(syncOps.plain(parsed), {
      0: "hello",
    });
  });

  it("recognizes a function call", () => {
    const parsed = parse(" fn ( arg ) ");
    assert.deepEqual(syncOps.plain(parsed), {
      0: {
        key: "fn",
        value: {
          0: "arg",
        },
      },
    });
  });

  it("recognizes a nested function call", () => {
    const parsed = parse("a(b(c))");
    const plain = syncOps.plain(parsed);
    assert.deepEqual(plain, {
      0: {
        key: "a",
        value: {
          0: {
            key: "b",
            value: {
              0: "c",
            },
          },
        },
      },
    });
  });
});
