import path from "path";
import meta from "../builtins/meta.js";
import StringWithGraph from "../framework/StringWithGraph.js";

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

async function loadMetaGraph(buffer) {
  const yaml = loadText(buffer);
  const graph = await meta.call(this, yaml);
  return new StringWithGraph(yaml, graph);
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
