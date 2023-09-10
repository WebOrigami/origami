import { GraphHelpers, SiteGraph } from "@graphorigami/core";
import FileLoadersTransform from "../common/FileLoadersTransform.js";

export default async function graphHttp(host, ...keys) {
  const mapped = keys.map((key) =>
    key === GraphHelpers.defaultValueKey ? "" : key
  );
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
  return new (FileLoadersTransform(SiteGraph))(href);
}

graphHttp.usage = `@graphHttp <domain>, <...keys>\tA web site graph via HTTP`;
graphHttp.documentation = "https://graphorigami.org/language/@graphHttp.html";
