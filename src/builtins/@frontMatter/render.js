import { outputWithGraph } from "../../core/utilities.js";
import get from "./get.js";

export default async function render(value, data) {
  const graph = data ?? get(value);
  const text = await outputWithGraph(value, graph, true);
  return text;
}
