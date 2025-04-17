import assert from "node:assert";
import { describe, test } from "node:test";
import parseExtensions from "../../src/operations/parseExtensions.js";

describe("keyMapsForExtensions", () => {
  test("source and result extension are the same", async () => {
    assert.deepEqual(parseExtensions(".foo"), {
      sourceExtension: ".foo",
      resultExtension: ".foo",
    });
  });

  test("change extension", async () => {
    assert.deepEqual(parseExtensions(".foo->.bar"), {
      sourceExtension: ".foo",
      resultExtension: ".bar",
    });
    // with Unicode Rightwards Arrow
    assert.deepEqual(parseExtensions(".foo→.bar"), {
      sourceExtension: ".foo",
      resultExtension: ".bar",
    });
  });

  test("add extension", async () => {
    assert.deepEqual(parseExtensions("->.foo"), {
      sourceExtension: "",
      resultExtension: ".foo",
    });
    assert.deepEqual(parseExtensions("→.foo"), {
      sourceExtension: "",
      resultExtension: ".foo",
    });
  });

  test("remove extension", async () => {
    assert.deepEqual(parseExtensions(".foo->"), {
      sourceExtension: ".foo",
      resultExtension: "",
    });
    assert.deepEqual(parseExtensions(".foo→"), {
      sourceExtension: ".foo",
      resultExtension: "",
    });
  });

  test("slash is a valid extension", async () => {
    assert.deepEqual(parseExtensions("/"), {
      sourceExtension: "/",
      resultExtension: "/",
    });
    assert.deepEqual(parseExtensions(".foo->/"), {
      sourceExtension: ".foo",
      resultExtension: "/",
    });
    assert.deepEqual(parseExtensions("/->.bar"), {
      sourceExtension: "/",
      resultExtension: ".bar",
    });
  });
});
