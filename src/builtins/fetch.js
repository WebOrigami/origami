import fetch from "node-fetch";

export default async function fetchCommand(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  // HACK: Use Node Buffer everywhere for now.
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
}

fetchCommand.usage = `fetch <url>\tFetch the resource at the given URL`;
fetchCommand.documentation = "https://graphorigami.org/cli/builtins.html#fetch";
