import path from "path";
import meta from "../builtins/meta.js";
import ExplorableGraph from "../core/ExplorableGraph.js";

const defaultLoaders = {
  ".css": loadText,
  ".htm": loadText,
  ".html": loadText,
  ".js": loadText,
  // ".json": loadGraph,
  ".meta": loadMetaGraph,
  ".md": loadText,
  ".ori": loadOrigamiTemplate,
  ".txt": loadText,
  ".xhtml": loadText,
  // ".yml": loadGraph,
  // ".yaml": loadGraph,
};

export default function FileLoadersTransform(Base) {
  return class FileLoaders extends Base {
    constructor(...args) {
      super(...args);
      this.loaders = defaultLoaders;
    }

    async get(key) {
      let value = await super.get(key);
      if (
        (typeof value === "string" || value instanceof Buffer) &&
        typeof key === "string"
      ) {
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

async function loadGraph(buffer) {
  const text = loadText(buffer);
  const textWithGraph = new String(text);
  /** @type {any} */ (textWithGraph).toGraph = () => ExplorableGraph.from(text);
  return textWithGraph;
}

async function loadMetaGraph(buffer) {
  const text = loadText(buffer);
  const textWithGraph = new String(text);
  // REVIEW: Want to make toGraph lazy, but at the moment it can't be async.
  // function toGraph() {
  //   return meta.call(this, text);
  // }
  // /** @type {any} */ (textWithGraph).toGraph = toGraph;
  const graph = await meta.call(this, text);
  /** @type {any} */ (textWithGraph).toGraph = () => graph;
  return textWithGraph;
}

async function loadOrigamiTemplate(buffer) {
  const { default: OrigamiTemplate } = await import(
    "../framework/OrigamiTemplate.js"
  );
  return new OrigamiTemplate(loadText(buffer), this);
}

function loadText(buffer) {
  return buffer instanceof Buffer ? String(buffer) : buffer;
}
