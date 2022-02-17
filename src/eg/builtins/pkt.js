import ExplorableGraph from "../../core/ExplorableGraph.js";
import execute from "../execute.js";
import * as parse from "../parse.js";

/**
 * Apply a pika template.
 *
 * @param {any} template
 * @param {Explorable} [variant]
 * @this {Explorable}
 */
export default async function pkt(template, variant) {
  const templateText = template.toString();
  const parsed = await parse.template(templateText);
  if (!parsed || parsed.rest !== "") {
    throw new Error(`Couldn't parse template`);
  }
  const code = parsed.value;
  const graph = ExplorableGraph.from(variant ?? this);
  const result = await execute.call(graph, code);
  return result;
}
