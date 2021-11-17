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
      input.context = this?.graph;
      template = frontMatter.content;
    }
  }

  const partials = await getPartials(this?.scope, template);

  const data =
    typeof input === "string" || input instanceof Buffer
      ? YAML.parse(String(input))
      : isPlainObject(input)
      ? input
      : ExplorableGraph.canCastToExplorable(input)
      ? await ExplorableGraph.plain(input)
      : input ?? {};

  const options = { partials };
  const compiled = Handlebars.compile(template);
  const result = compiled(data, options);
  return result;
}

function findPartialReferences(template) {
  // Partials:
  // start with "{{>" or "{{#>"
  // then have optional whitespace
  // then start with a character that's not a "@" (like the special @partial-block)
  // then continue with any number of characters that aren't whitespace or a "}"
  const regex = /{{#?>\s*(?<name>[^@][^\s}]+)/g;
  const matches = [...template.matchAll(regex)];
  const names = matches.map((match) => match.groups.name);
  const unique = [...new Set(names)];
  return unique;
}

async function getPartials(scope, template) {
  const partialNames = findPartialReferences(template);
  const partialKeys = partialNames.map((name) => `${name}.hbs`);
  let partials = {};
  if (partialKeys.length > 0) {
    if (!scope) {
      throw `A Handlebars template references partials (${partialKeys}), but no scope graph was provided in which to search for them.`;
    }
    const partialPromises = partialKeys.map(async (name) => scope.get(name));
    const partialValues = await Promise.all(partialPromises);
    partialValues.forEach((value, index) => {
      partials[partialNames[index]] = value;
    });
  }
  return partials;
}

hbs.usage = `hbs(template, data)\tGenerate content from a Handlebars template and data`;
