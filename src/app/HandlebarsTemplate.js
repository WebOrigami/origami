import Handlebars from "handlebars";
import DefaultPages from "../app/DefaultPages.js";
import MetaMixin from "../app/MetaMixin.js";
import StringWithGraph from "../app/StringWithGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import * as utilities from "../core/utilities.js";
import {
  applyMixinToObject,
  extractFrontMatter,
  isPlainObject,
} from "../core/utilities.js";

/**
 * A representation of a Handlebars template that has both a string form
 * and a function form that can be invoked to apply the template to data.
 */
export default class HandlebarsTemplate {
  constructor(text, graph) {
    this.text = String(text);
    this.graph = graph;

    // Extract the template and possibly front matter from the text.
    const frontMatter = extractFrontMatter(this.text);
    if (frontMatter) {
      const { frontData, bodyText } = frontMatter;
      this.frontData = frontData;
      this.template = bodyText;
    } else {
      // No front matter.
      this.frontData = null;
      this.template = this.text;
    }
  }

  /**
   * Apply the template to the given input data.
   *
   * @param {any} [input]
   */
  async apply(input) {
    const data = input
      ? await this.dataFromInput(input)
      : await this.interpretFrontMatter();
    if (!data && arguments.length === 2) {
      // Caller explicitly passed in `undefined` as the input argument, and
      // there's no frontmatter. Most likely the input parameter is a variable
      // pattern that didn't match, in which case we define the template result as
      // undefined.
      return undefined;
    }

    const partials = await this.getPartials(this.graph, this.template);

    /** @type {any} */ const options = { partials };
    const compiled = Handlebars.compile(this.template);

    try {
      const text = compiled(data, options);
      const dataGraph = isPlainObject(data) ? new DefaultPages(data) : null;
      const result = dataGraph ? new StringWithGraph(text, dataGraph) : text;
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

  // Extract the data from the given input.
  async dataFromInput(input) {
    if (typeof input === "string" || input instanceof Buffer) {
      return utilities.parse(String(input));
    } else if (isPlainObject(input)) {
      return input;
    } else if (ExplorableGraph.canCastToExplorable(input)) {
      return await ExplorableGraph.plain(input);
    } else if (input) {
      return input;
    } else {
      return {};
    }
  }

  // If the template contains front matter, process the front matter data as a
  // metagraph and return the plain result of that graph as the data; the body
  // text of the template is returned as the template. If no front matter is
  // found, return `null` for the data and the original template as the
  // template.
  async interpretFrontMatter() {
    if (this.frontData) {
      const frontGraph = ExplorableGraph.from(this.frontData);
      const graph = applyMixinToObject(MetaMixin, frontGraph);
      /** @type {any} */ (graph).scope = this.graph;
      const data = await ExplorableGraph.plain(graph);
      return data;
    } else {
      return null;
    }
  }

  async getPartials(graph, template) {
    // Find the names of the partials used in the template.
    const partialNames = this.partialReferences(template);

    // Map those to corresponding .hbs filenames.
    const partialKeys = partialNames.map((name) => `${name}.hbs`);
    let partials = {};

    if (partialKeys.length > 0) {
      if (!this.graph) {
        throw `A Handlebars template references partials (${partialKeys}), but no scope graph was provided in which to search for them.`;
      }

      // Get the partials from the graph.
      const partialPromises = partialKeys.map(async (name) => graph.get(name));
      const partialValues = await Promise.all(partialPromises);

      // Check to see whether any partials are missing.
      partialValues
        .filter((value) => value === undefined)
        .forEach((value, index) => {
          console.warn(`Partial ${partialKeys[index]} not found in graph.`);
        });

      partialValues.forEach((value, index) => {
        if (value) {
          partials[partialNames[index]] = String(value);
        }
      });

      // The partials may themselves reference other partials; collect those too.
      await Promise.all(
        partialValues.map(async (value) => {
          if (value) {
            const nestedPartials = await this.getPartials(graph, String(value));
            Object.assign(partials, nestedPartials);
          }
        })
      );
    }
    return partials;
  }

  partialReferences(template) {
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

  toFunction() {
    const templateFunction = this.apply.bind(this);
    /** @this {Explorable} */
    return async function (data) {
      return data !== undefined
        ? await templateFunction(data)
        : await templateFunction();
    };
  }

  toString() {
    return this.template;
  }
}
