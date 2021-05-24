export default async function () {
  // @ts-ignore
  const graph = this;
  const buffer = await graph.get("index.txt");
  const text = String(buffer).trim();
  return `<p>${text}</p>`;
}
