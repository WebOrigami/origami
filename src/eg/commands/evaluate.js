import FormulasObject from "../../app/FormulasObject.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import config from "./config.js";

export default async function evaluate(variant, ...path) {
  const graph = ExplorableGraph.from(variant);
  const plain = await ExplorableGraph.plain(graph);
  const evaluated = new FormulasObject(plain);
  evaluated.scope = await config();
  evaluated.context = this.graph;
  return path.length > 0 ? await evaluated.get(...path) : evaluated;
}

evaluate.usage = `evaluate(graph)\tEvaluate the formulas in the keys of the graph`;
