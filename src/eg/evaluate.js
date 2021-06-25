import execute from "./execute.js";
import link from "./link.js";
import parse from "./parse.js";

export default async function evaluate(source, scope = {}, graph) {
  const parsed = parse(source);
  const linked = await link(parsed, scope);
  const result = await execute(linked, graph);
  return result;
}
