import Handlebars from "handlebars";
import YAML from "yaml";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { isPlainObject } from "../../core/utilities.js";

export default async function hbs(template, variant) {
  const data =
    typeof variant === "string" || variant instanceof Buffer
      ? YAML.parse(String(variant))
      : isPlainObject(variant)
      ? variant
      : ExplorableGraph.canCastToExplorable(variant)
      ? await ExplorableGraph.plain(variant)
      : variant;
  if (data) {
    const compiled = Handlebars.compile(String(template));
    const result = compiled(data);
    return result;
  } else {
    return undefined;
  }
}

hbs.usage = `hbs(template, data)\tGenerate content from a Handlebars template and data`;
