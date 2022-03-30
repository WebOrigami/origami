import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Concatenate the text content of objects or graphs.
 *
 * @this {Explorable}
 * @param {any[]} args
 */
export default async function concat(...args) {
  if (args.length === 0) {
    const defaultGraph = await this.get("@defaultGraph");
    if (defaultGraph === undefined) {
      return undefined;
    }
  }
  const scope = this;
  const textPromises = args.map(async (arg) => {
    if (typeof arg === "function") {
      arg = await arg.call(scope);
    }

    if (typeof arg === "string") {
      return arg;
    } else if (ExplorableGraph.canCastToExplorable(arg)) {
      const values = await ExplorableGraph.values(arg);
      return concat.call(scope, ...values);
    } else if (arg === undefined) {
      return "";
    } else {
      return arg.toString();
    }
  });
  const text = await Promise.all(textPromises);
  return text.join("");
}

concat.usage = `concat <...objs>\tConcatenate text and/or graphs of text`;
concat.documentation = "https://explorablegraph.org/cli/builtins.html#concat";
