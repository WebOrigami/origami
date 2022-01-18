import fetch from "node-fetch";

export default async function fetchCommand(url) {
  const response = await fetch(url);
  return response.buffer();
}

fetchCommand.usage = `fetch <url>\tFetch the resource at the given URL`;
