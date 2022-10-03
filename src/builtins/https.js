import fetch from "node-fetch";

export default async function https(domain, ...keys) {
  const url = ["https:/", domain, ...keys].join("/");
  const response = await fetch(url);
  if (response.ok) {
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
  }
  return undefined;
}

https.usage = `https <domain>, <...keys>\tA web resource via HTTPS`;
https.documentation = "https://graphorigami.org/cli/builtins.html#https";
