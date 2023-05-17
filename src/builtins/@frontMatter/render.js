import { outputWithGraph } from "../../core/utilities.js";

export default async function render(value, data) {
  const graph = data ?? value.toGraph();
  const text = await outputWithGraph(value, graph, true);
  return text;
}
