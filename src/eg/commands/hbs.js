import Handlebars from "handlebars";
import YAML from "yaml";
import DefaultPages from "../../app/DefaultPages.js";
import MetaMixin from "../../app/MetaMixin.js";
import StringWithGraph from "../../app/StringWithGraph.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import {
  applyMixinToObject,
  extractFrontMatter,
  isPlainObject,
} from "../../core/utilities.js";

/**
 * Apply the indicated Handlebars template to the given data and return the
 * result.
 *
 * @this {ProgramContext}
 * @param {string} template
 * @param {Explorable|PlainObject} input
 */
export default async function hbs(template, input) {
  template = String(template);
  if (!input) {
    // See if template defines front matter.
    const { frontMatter, content } = extractFrontMatter(template);
    if (frontMatter && ExplorableGraph.canCastToExplorable(frontMatter)) {
      const frontGraph = ExplorableGraph.from(frontMatter);
      input = applyMixinToObject(MetaMixin, frontGraph);
      input.scope = this?.graph;
      template = content;
    } else if (arguments.length === 2) {
      // Caller explicitly passed in `undefined` as the input argument,
      // and there's no frontmatter. Most likely the input parameter is
      // a variable pattern that didn't match, in which case we define
      // the template result as undefined.
      return undefined;
    }
  }

  const partials = await getPartials(this?.graph, template);

  const data =
    typeof input === "string" || input instanceof Buffer
      ? YAML.parse(String(input))
      : isPlainObject(input)
      ? input
      : ExplorableGraph.canCastToExplorable(input)
      ? await ExplorableGraph.plain(input)
      : input ?? {};

  /** @type {any} */ const options = { partials };
  const compiled = Handlebars.compile(template);
  try {
    const text = compiled(data, options);
    const dataGraph = new DefaultPages(data);
    const result = new StringWithGraph(text, dataGraph);
    return result;
  } catch (/** @type {any} */ error) {
    // If we're asked to directly render a template that includes a
    // @partial-block (i.e., without invoking that as a partial in some other
    // template), then just return undefined rather than throwing an error.
    if (error.message === "The partial @partial-block could not be found") {
      return undefined;
    }
    throw error;
  }
}

function findPartialReferences(template) {
  // Partials:
  // start with "{{>" or "{{#>"
  // then have optional whitespace
  // then start with a character that's not a "@" (like the special @partial-block)
  // then continue with any number of characters that aren't whitespace or a "}"
  // and aren't a reference to `partial-block`
  const regex = /{{#?>\s*(?<name>[^@\s][^\s}]+)/g;
  const matches = [...template.matchAll(regex)];
  const names = matches.map((match) => match.groups.name);
  const unique = [...new Set(names)];
  return unique;
}

async function getPartials(graph, template) {
  // Find the names of the partials used in the template.
  const partialNames = findPartialReferences(template);

  // Map those to corresponding .hbs filenames.
  const partialKeys = partialNames.map((name) => `${name}.hbs`);
  let partials = {};

  if (partialKeys.length > 0) {
    if (!graph) {
      throw `A Handlebars template references partials (${partialKeys}), but no scope graph was provided in which to search for them.`;
    }

    // Get the partials from the graph.
    const partialPromises = partialKeys.map(async (name) => graph.get(name));
    const partialValues = await Promise.all(partialPromises);
    partialValues.forEach((value, index) => {
      partials[partialNames[index]] = String(value);
    });

    // The partials may themselves reference other partials; collect those too.
    await Promise.all(
      partialValues.map(async (value) => {
        const nestedPartials = await getPartials(graph, value);
        Object.assign(partials, nestedPartials);
      })
    );
  }
  return partials;
}

hbs.usage = `hbs(template, data)\tGenerate content from a Handlebars template and data`;
