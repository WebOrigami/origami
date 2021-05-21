export default async function keys(graph) {
  return await graph.keys();
}

keys.usage = `keys(graph)\tThe top-level keys in the graph`;
