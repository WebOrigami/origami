import { SiteTree, Tree } from "@graphorigami/core";
import FileLoadersTransform from "../common/FileLoadersTransform.js";
import { treeWithScope } from "../common/utilities.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @typedef {import("../..").Invocable} Invocable
 *
 * @this {AsyncDictionary|null}
 * @param {string} host
 * @param  {...(string|Symbol)} keys
 */
export default async function treeHttps(host, ...keys) {
  const mapped = keys.map((key) => (key === Tree.defaultValueKey ? "" : key));
  let href = [host, ...mapped].join("/");
  if (!href.startsWith("https") || !href.startsWith("http")) {
    if (!href.startsWith("//")) {
      href = `//${href}`;
    }
    if (!href.startsWith("http")) {
      href = `https:${href}`;
    }
  }

  /** @type {AsyncTree} */
  let result = new (FileLoadersTransform(SiteTree))(href);
  if (this) {
    result = treeWithScope(result, this);
  }
  return result;
}

treeHttps.usage = `@treeHttps <domain>, <...keys>\tA web site tree via HTTPS`;
treeHttps.documentation = "https://graphorigami.org/language/@treeHttps.html";
