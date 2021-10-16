import Handlebars from "handlebars";
import YAML from "yaml";
import FormulasObject from "../../app/FormulasObject.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { extractFrontMatter, isPlainObject } from "../../core/utilities.js";
import config from "./config.js";

export default async function hbs(template, input) {
  template = String(template);
  if (!input) {
    // See if template defines front matter.
    const frontMatter = extractFrontMatter(template);
    if (frontMatter) {
      input = new FormulasObject(frontMatter);
      input.scope = await config();
      input.context = this.graph;
      template = frontMatter.content;
    }
  }
  const data =
    typeof input === "string" || input instanceof Buffer
      ? YAML.parse(String(input))
      : isPlainObject(input)
      ? input
      : ExplorableGraph.canCastToExplorable(input)
      ? await ExplorableGraph.plain(input)
      : input;
  if (data) {
    const compiled = Handlebars.compile(template);
    const result = compiled(data);
    return result;
  } else {
    return undefined;
  }
}

hbs.usage = `hbs(template, data)\tGenerate content from a Handlebars template and data`;
