export default async function plain(graph) {
  return await graph.plain();
}

plain.usage = `plain(graph)\tA plain JavaScript object representation of the graph`;
