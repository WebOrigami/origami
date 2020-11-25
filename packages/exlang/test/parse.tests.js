import { syncOps } from "@explorablegraph/exfn";
import chai from "chai";
import parse from "../src/parse.js";
const { assert } = chai;

describe("parse", () => {
  it("recognizes text as text", () => {
    const parsed = parse("hello");
    assert.deepEqual(syncOps.plain(parsed), {
      String: "hello",
    });
  });

  it("recognizes a function call", () => {
    const parsed = parse(" fn ( arg ) ");
    assert.deepEqual(syncOps.plain(parsed), {
      fn: {
        String: "arg",
      },
    });
  });

  it("recognizes a nested function call", () => {
    const parsed = parse("a(b(c))");
    assert.deepEqual(syncOps.plain(parsed), {
      a: {
        b: {
          String: "c",
        },
      },
    });
  });
});
