export default async function strings(graph) {
  return await graph.strings();
}

strings.usage = `strings(graph)\tCast both the keys and values of the graph to strings`;
