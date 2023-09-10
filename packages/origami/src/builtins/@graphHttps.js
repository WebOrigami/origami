import { GraphHelpers, SiteGraph } from "@graphorigami/core";
import FileLoadersTransform from "../common/FileLoadersTransform.js";

export default async function graphHttps(host, ...keys) {
  const mapped = keys.map((key) =>
    key === GraphHelpers.defaultValueKey ? "" : key
  );
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
  return new (FileLoadersTransform(SiteGraph))(href);
}

graphHttps.usage = `@graphHttps <domain>, <...keys>\tA web site graph via HTTPS`;
graphHttps.documentation = "https://graphorigami.org/language/@graphHttps.html";
