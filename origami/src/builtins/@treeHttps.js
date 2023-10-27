import { SiteTree, Tree } from "@graphorigami/core";
import FileLoadersTransform from "../runtime/FileLoadersTransform.js";
import Scope from "../runtime/Scope.js";

/**
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @typedef {import("../..").Invocable} Invocable
 *
 * @this {AsyncTree|null}
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
  result = Scope.treeWithScope(result, this);
  return result;
}

treeHttps.usage = `@treeHttps <domain>, <...keys>\tA web site tree via HTTPS`;
treeHttps.documentation = "https://graphorigami.org/language/@treeHttps.html";
