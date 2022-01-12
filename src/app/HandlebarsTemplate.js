import Handlebars from "handlebars";
import DefaultPages from "../app/DefaultPages.js";
import StringWithGraph from "../app/StringWithGraph.js";
import Compose from "../common/Compose.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import * as utilities from "../core/utilities.js";
import {
  extractFrontMatter,
  isPlainObject,
  transformObject,
} from "../core/utilities.js";
import MetaTransform from "./MetaTransform.js";

/**
 * A representation of a Handlebars template that has both a string form
 * and a function form that can be invoked to apply the template to data.
 */
export default class HandlebarsTemplate {
  constructor(text, location) {
    this.text = String(text);
    this.location = location;

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
   * Apply the template to the given input data in the context of a graph.
   *
   * @param {any} [input]
   * @param {Explorable} [graph]
   */
  async apply(input, graph) {
    const data = input
      ? await this.dataFromInput(input, graph)
      : await this.interpretFrontMatter(graph);
    if (input === undefined && !data) {
      // Caller explicitly passed in `undefined` as the input argument, and
      // there's no frontmatter. Most likely the input parameter is a variable
      // pattern that didn't match, in which case we define the template result as
      // undefined.
      return undefined;
    }

    const partials = await this.getPartials(this.location, this.template);

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
  // If the template itself has front matter, and the input and front matter can
  // be composed, do that.
  async dataFromInput(input, graph) {
    // Step 1: parse the input if necessary.
    let parsed = input;
    if (typeof input === "string" || input instanceof Buffer) {
      parsed = utilities.parse(String(input));
      if (typeof parsed === "string") {
        // Interpret the parsed string as a `bodyText` field.
        parsed = { bodyText: parsed };
      }
    }

    // Step two: compose if we can and convert to plain object or array.
    let data = parsed;
    if (isPlainObject(input)) {
      if (this.frontData) {
        // Compose (parsed) input on top of front matter.
        parsed = Object.assign({}, this.frontData, parsed);
      }
      // Interpret the parsed object as a metagraph.
      const explorable = ExplorableGraph.from(parsed);
      const meta = transformObject(MetaTransform, explorable);
      if (graph) {
        /** @type {any} */ (meta).parent = graph;
      }
      data = await ExplorableGraph.plain(meta);
    } else if (ExplorableGraph.isExplorable(input)) {
      // If template has front matter, compose input on top of that.
      const composed = this.frontData
        ? new Compose(input, this.frontData)
        : input;
      data = await ExplorableGraph.plain(composed);
    }

    return data;
  }

  // If the template contains front matter, process the front matter data as a
  // metagraph and return the plain result of that graph as the data; the body
  // text of the template is returned as the template. If no front matter is
  // found, return `null` for the data and the original template as the
  // template.
  //
  // The supplied parent is used as the parent for the front matter graph.
  async interpretFrontMatter(parent) {
    if (this.frontData) {
      const frontGraph = ExplorableGraph.from(this.frontData);
      const meta = transformObject(MetaTransform, frontGraph);
      /** @type {any} */ (meta).parent = parent;
      const data = await ExplorableGraph.plain(meta);
      return data;
    } else {
      return null;
    }
  }

  async getPartials(location, template, partials = {}) {
    // Find the names of the partials used in the template.
    const partialReferences = this.partialReferences(template);

    // Which partials have we not already collected?
    const newPartials = partialReferences.filter((name) => !partials[name]);

    // Map those to corresponding .hbs filenames.
    const partialKeys = newPartials.map((name) => `${name}.hbs`);

    if (partialKeys.length > 0) {
      if (!this.location) {
        throw `A Handlebars template references partials (${partialKeys}), but no scope graph was provided in which to search for them.`;
      }

      // Get the partials from the graph.
      const scope = location.scope ?? location;
      const partialPromises = partialKeys.map(async (name) => scope.get(name));
      const partialValues = await Promise.all(partialPromises);

      // Check to see whether any partials are missing.
      partialValues
        .filter((value) => value === undefined)
        .forEach((value, index) => {
          console.warn(`Partial ${partialKeys[index]} not found in graph.`);
        });

      partialValues.forEach((value, index) => {
        if (value) {
          partials[newPartials[index]] = String(value);
        }
      });

      // The partials may themselves reference other partials; collect those too.
      await Promise.all(
        partialValues.map(async (value) => {
          if (value) {
            const nestedPartials = await this.getPartials(
              location,
              String(value),
              partials
            );
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
        ? await templateFunction(data, this)
        : await templateFunction(undefined, this);
    };
  }

  toString() {
    return this.text;
  }
}
