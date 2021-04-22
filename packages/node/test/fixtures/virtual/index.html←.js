export default async function (graph) {
  const buffer = await graph.get("index.txt");
  const text = String(buffer).trim();
  return `<p>${text}</p>`;
}
