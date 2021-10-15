import FormulasObject from "../../app/FormulasObject.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import config from "./config.js";

export default async function formulas(variant, ...path) {
  const graph = ExplorableGraph.from(variant);
  const plain = await ExplorableGraph.plain(graph);
  const formulas = new FormulasObject(plain);
  formulas.scope = await config();
  formulas.context = this.graph;
  return path.length > 0 ? await formulas.get(...path) : formulas;
}

formulas.usage = `eg(graph)\tReturn a ExplorableApp graph based on the given graph`;
