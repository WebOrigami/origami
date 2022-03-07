import Handlebars from "handlebars";
import Template from "./Template.js";

/**
 * A representation of a Handlebars template that has both a string form
 * and a function form that can be invoked to apply the template to data.
 */
export default class HandlebarsTemplate extends Template {
  async compile() {
    const partials = await this.getPartials(this.location, this.template);
    const options = { partials };

    const compiled = Handlebars.compile(this.template);
    return async (data, graph) => compiled(data, options);
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
}
