import { syncOps } from "@explorablegraph/exfn";
import chai from "chai";
import parse from "../src/parse.js";
const { assert } = chai;

describe("parse", () => {
  it("recognizes text as text", () => {
    const parsed = parse("hello");
    assert.deepEqual(syncOps.plain(parsed), {
      key: "String",
      value: "hello",
    });
  });

  it("recognizes a function call", () => {
    const parsed = parse(" fn ( arg ) ");
    assert.deepEqual(syncOps.plain(parsed), {
      key: "fn",
      value: {
        key: "String",
        value: "arg",
      },
    });
  });

  it("recognizes a nested function call", () => {
    const parsed = parse("a(b(c))");
    assert.deepEqual(syncOps.plain(parsed), {
      key: "a",
      value: {
        key: "b",
        value: {
          key: "String",
          value: "c",
        },
      },
    });
  });
});
