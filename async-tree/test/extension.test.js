import assert from "node:assert";
import { describe, test } from "node:test";
import { extname, match, replace } from "../src/extension.js";

describe("extension", () => {
  test("extname", () => {
    assert.equal(extname(".\\"), "");
    assert.equal(extname("..\\"), ".\\");
    assert.equal(extname("file.ext\\"), ".ext\\");
    assert.equal(extname("file.ext\\\\"), ".ext\\\\");
    assert.equal(extname("file\\"), "");
    assert.equal(extname("file\\\\"), "");
    assert.equal(extname("file.\\"), ".\\");
    assert.equal(extname("file.\\\\"), ".\\\\");
  });

  test("match", () => {
    assert.equal(match("file.md", ".md"), "file");
    assert.equal(match("file.md", ".txt"), null);
    assert.equal(match("file.md/", ".md"), "file/");
    assert.equal(match("file", ""), "file");
    assert.equal(match("file", "/"), null);
    assert.equal(match("file/", "/"), "file");
  });

  test("match can handle multi-part extensions", () => {
    assert.equal(match("foo.ori.html", ".ori.html"), "foo");
    assert.equal(match("foo.ori.html", ".html"), "foo.ori");
    assert.equal(match("foo.ori.html", ".txt"), null);
    assert.equal(match("foo.ori.html/", ".ori.html"), "foo/");
  });

  test("replace", () => {
    assert.equal(replace("file.md", ".md", ".html"), "file.html");
    assert.equal(replace("file.md", ".txt", ".html"), "file.md");
    assert.equal(replace("file.md/", ".md", ".html"), "file.html/");
    assert.equal(replace("folder/", "", ".html"), "folder.html");
    assert.equal(replace("folder", "/", ".html"), "folder");
    assert.equal(replace("folder/", "/", ".html"), "folder.html");
  });
});
