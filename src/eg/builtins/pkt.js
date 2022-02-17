import ExplorableGraph from "../../core/ExplorableGraph.js";
import execute from "../execute.js";
import * as parse from "../parse.js";

export default async function pkt(template, variant = this) {
  const templateText = template.toString();
  const { value: code, rest } = await parse.template(templateText);
  if (rest !== "") {
    throw new Error(`Couldn't parse template`);
  }
  const graph = ExplorableGraph.from(variant);
  const result = await execute.call(graph, code);
  return result;
}
