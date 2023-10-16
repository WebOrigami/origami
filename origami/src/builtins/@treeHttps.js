import { SiteTree, Tree } from "@graphorigami/core";
import FileLoadersTransform from "../common/FileLoadersTransform.js";

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
  if (!href.endsWith("/")) {
    href += "/";
  }
  return new (FileLoadersTransform(SiteTree))(href);
}

treeHttps.usage = `@treeHttps <domain>, <...keys>\tA web site tree via HTTPS`;
treeHttps.documentation = "https://graphorigami.org/language/@treeHttps.html";
