import { SiteTree, Tree } from "@graphorigami/core";
import FileLoadersTransform from "../common/FileLoadersTransform.js";

export default async function treeHttp(host, ...keys) {
  const mapped = keys.map((key) => (key === Tree.defaultValueKey ? "" : key));
  let href = [host, ...mapped].join("/");
  if (!href.startsWith("https") || !href.startsWith("http")) {
    if (!href.startsWith("//")) {
      href = `//${href}`;
    }
    if (!href.startsWith("http")) {
      href = `http:${href}`;
    }
  }
  if (!href.endsWith("/")) {
    href += "/";
  }
  return new (FileLoadersTransform(SiteTree))(href);
}

treeHttp.usage = `@treeHttp <domain>, <...keys>\tA web site tree via HTTP`;
treeHttp.documentation = "https://graphorigami.org/language/@treeHttp.html";
