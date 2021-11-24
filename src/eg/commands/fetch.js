import fetch from "node-fetch";

export default async function fetchCommand(url) {
  const response = await fetch(url);
  return response.buffer();
}

fetch.usage = `fetch(url)\tFetch the resource at the given URL`;
