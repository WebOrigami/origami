export default async function fetchBuiltin(href) {
  const response = await fetch(href);
  return response.ok ? await response.arrayBuffer() : undefined;
}

fetchBuiltin.usage = `@fetch href\tReturns the contents of the given URL as an ArrayBuffer`;
fetchBuiltin.documentation = "https://weborigami.org/languages/@fetch.html";
