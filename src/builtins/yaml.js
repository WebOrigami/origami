import YAML from "yaml";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { toSerializable } from "../core/utilities.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Render the object as text in YAML format.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function toYaml(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  } else if (ExplorableGraph.canCastToExplorable(variant)) {
    return ExplorableGraph.toYaml(variant);
  } else {
    const serializable = toSerializable(variant);
    return YAML.stringify(serializable);
  }
}

toYaml.usage = `yaml <obj>\tRender the object as text in YAML format`;
toYaml.documentation = "https://graphorigami.org/cli/builtins.html#yaml";
