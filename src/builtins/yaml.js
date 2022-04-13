import YAML from "yaml";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { toSerializable } from "../core/utilities.js";

/**
 * Render the object as text in YAML format.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function yaml(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  } else if (variant instanceof Buffer) {
    variant = String(variant);
  }
  if (ExplorableGraph.canCastToExplorable(variant)) {
    return ExplorableGraph.toYaml(variant);
  } else {
    const serializable = toSerializable(variant);
    return YAML.stringify(serializable);
  }
}

yaml.usage = `yaml <obj>\tRender the object as text in YAML format`;
yaml.documentation = "https://explorablegraph.org/cli/builtins.html#yaml";
