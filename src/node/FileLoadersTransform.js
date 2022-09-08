import path from "node:path";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { stringLike, transformObject } from "../core/utilities.js";
import { isFormulasTransformApplied } from "../framework/FormulasTransform.js";
import MetaTransform from "../framework/MetaTransform.js";

const defaultLoaders = {
  ".css": loadText,
  ".htm": loadText,
  ".html": loadText,
  ".js": loadText,
  ".json": loadText,
  ".meta": loadMetaGraph,
  ".md": loadText,
  ".ori": loadOrigamiTemplate,
  ".txt": loadText,
  ".xhtml": loadText,
  ".yml": loadText,
  ".yaml": loadText,
};

export default function FileLoadersTransform(Base) {
  return class FileLoaders extends Base {
    constructor(...args) {
      super(...args);
      this.loaders = defaultLoaders;
    }

    async get(key) {
      let value = await super.get(key);
      if (stringLike(value) && typeof key === "string") {
        const extname = path.extname(key).toLowerCase();
        const loader = this.loaders[extname];
        if (loader) {
          value = await loader.call(this, value);
        }
      }
      return value;
    }
  };
}

/**
 * @this {Explorable}
 */
async function loadMetaGraph(buffer) {
  const text = loadText(buffer);
  const textWithGraph = new String(text);
  const scope = this;
  let meta;
  function toGraph() {
    if (!meta) {
      const graph = ExplorableGraph.from(text);
      meta = isFormulasTransformApplied(graph)
        ? graph
        : transformObject(MetaTransform, graph);
      meta.parent = scope;
    }
    return meta;
  }
  /** @type {any} */ (textWithGraph).toGraph = toGraph;
  return textWithGraph;
}

/**
 * @this {Explorable}
 */
async function loadOrigamiTemplate(buffer) {
  const { default: OrigamiTemplate } = await import(
    "../framework/OrigamiTemplate.js"
  );
  return new OrigamiTemplate(loadText(buffer), this);
}

function loadText(buffer) {
  return buffer instanceof Buffer || buffer instanceof String
    ? String(buffer)
    : buffer;
}
