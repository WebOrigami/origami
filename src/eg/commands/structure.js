export default async function structure(graph) {
  return await graph.structure();
}

structure.usage = `structure(graph)\tA plain object with the structure of the graph but null values`;
