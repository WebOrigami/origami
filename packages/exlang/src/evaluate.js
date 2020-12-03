import execute from "../src/execute.js";
import link from "../src/link.js";
import parse from "../src/parse.js";

export default async function evaluate(source, scope, argument) {
  const parsed = parse(source);
  const linked = await link(parsed, scope);
  const result = execute(linked, argument);
  return result;
}
