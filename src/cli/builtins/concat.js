import ExplorableGraph from "../../core/ExplorableGraph.js";

/**
 * Concatenate the text content of objects or graphs.
 *
 * @this {Explorable}
 * @param {any[]} args
 */
export default async function concat(...args) {
  if (args.length === 0) {
    args = [this];
  }
  const textPromises = args.map(async (arg) =>
    typeof arg === "string"
      ? arg
      : ExplorableGraph.canCastToExplorable(arg)
      ? concat(...(await ExplorableGraph.values(arg)))
      : arg === undefined
      ? ""
      : arg.toString()
  );
  const text = await Promise.all(textPromises);
  return text.join("");
}

concat.usage = `concat <...objs>\tConcatenate text and/or graphs of text`;
concat.documentation = "https://explorablegraph.org/pika/builtins.html#concat";
