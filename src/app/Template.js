import DefaultPages from "../app/DefaultPages.js";
import StringWithGraph from "../app/StringWithGraph.js";
import Compose from "../common/Compose.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import {
  extractFrontMatter,
  isPlainObject,
  parse,
  transformObject,
} from "../core/utilities.js";
import MetaTransform from "./MetaTransform.js";

export default class Template {
  constructor(text, location) {
    this.compiled = null;
    this.location = location;
    this.text = String(text);

    // Extract the template and possibly front matter from the text.
    const frontMatter = extractFrontMatter(this.text);
    if (frontMatter) {
      const { frontData, bodyText } = frontMatter;
      this.frontData = Object.assign(frontData, {
        template: bodyText,
      });
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
   * @param {Explorable} [graph]
   * @param {any} [input]
   * @param {Explorable} [graph]
   */
  async apply(input, graph) {
    const data = input
      ? await this.dataFromInput(input, graph)
      : await this.interpretFrontMatter(graph);
    // if (input === undefined && !data) {
    //   // Caller explicitly passed in `undefined` as the input argument, and
    //   // there's no frontmatter. Most likely the input parameter is a variable
    //   // pattern that didn't match, in which case we define the template result as
    //   // undefined.
    //   return undefined;
    // }

    if (!this.compiled) {
      const compiled = await this.compile();
      if (compiled) {
        this.compiled = compiled;
      } else {
        return undefined;
      }
    }

    try {
      const text = await this.compiled(data, graph);
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

  async compile() {
    return async (data, graph) => "";
  }

  // Extract the data from the given input.
  // If the template itself has front matter, and the input and front matter can
  // be composed, do that.
  async dataFromInput(input, graph) {
    // Step 1: parse the input if necessary.
    let parsed = input;
    if (typeof input === "string" || input instanceof Buffer) {
      parsed = parse(String(input));
      if (typeof parsed === "string") {
        // Interpret the parsed string as a `bodyText` field.
        parsed = { bodyText: parsed };
      }
    }

    // Step two: compose if we can and convert to plain object or array.
    let data = parsed;
    if (isPlainObject(parsed)) {
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
    } else if (ExplorableGraph.isExplorable(parsed)) {
      // If template has front matter, compose input on top of that.
      const composed = this.frontData
        ? new Compose(parsed, this.frontData)
        : parsed;
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
