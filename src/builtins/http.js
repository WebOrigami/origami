import fetch from "node-fetch";

export default async function http(domain, ...keys) {
  const url = ["http://", domain, ...keys].join("/");
  const response = await fetch(url);
  if (response.ok) {
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
  }
  return undefined;
}

http.usage = `http <domain>, <...keys>\tA web resource via HTTP`;
http.documentation = "http://graphorigami.org/cli/builtins.html#http";
