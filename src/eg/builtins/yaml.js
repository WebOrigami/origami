import YAML from "yaml";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { toSerializable } from "../../core/utilities.js";

/**
 * Render the object as text in YAML format.
 *
 * @this {Explorable}
 * @param {GraphVariant} [obj]
 */
export default async function yaml(obj) {
  obj = obj ?? this;
  if (obj instanceof Buffer) {
    obj = String(obj);
  }
  if (ExplorableGraph.canCastToExplorable(obj)) {
    return await ExplorableGraph.toYaml(obj);
  } else {
    const serializable = toSerializable(obj);
    return YAML.stringify(serializable);
  }
}

yaml.usage = `yaml(obj)\tRender the object as text in YAML format`;
