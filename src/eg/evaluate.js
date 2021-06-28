import execute from "./execute.js";
// import parse from "./parse.js";
import { expression } from "./parse2.js";

export default async function evaluate(source, scope, graph) {
  const { value: parsed } = expression(source);
  console.log(JSON.stringify(parsed));
  if (parsed) {
    // const linked = await link(parsed, scope);
    const result = await execute(parsed, scope, graph);
    return result;
  }
}
