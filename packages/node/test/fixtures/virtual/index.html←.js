import { asyncGet } from "@explorablegraph/symbols";

export default async function (graph) {
  const buffer = await graph[asyncGet]("index.txt");
  const text = String(buffer).trim();
  return `<p>${text}</p>`;
}
