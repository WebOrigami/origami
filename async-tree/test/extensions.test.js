import assert from "node:assert";
import { describe, test } from "node:test";
import { replaceExtension } from "../src/extensions.js";

describe("extensions", () => {
  test("replaceExtension", () => {
    assert.equal(replaceExtension("file.md", ".md", ".html"), "file.html");
    assert.equal(replaceExtension("file.md", ".txt", ".html"), "file.md");
    assert.equal(replaceExtension("file.md/", ".md", ".html"), "file.html/");
    assert.equal(replaceExtension("folder/", "", ".html"), "folder.html");
  });
});
