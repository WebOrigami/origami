import ExplorableGraph from "../core/ExplorableGraph.js";
import { extname, stringLike, transformObject } from "../core/utilities.js";
import { isFormulasTransformApplied } from "../framework/FormulasTransform.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import MetaTransform from "../framework/MetaTransform.js";
import OrigamiGraph from "../framework/OrigamiGraph.js";

const defaultLoaders = {
  ".css": loadText,
  ".graph": loadOrigamiGraph,
  ".htm": loadText,
  ".html": loadText,
  ".js": loadJavaScript,
  ".json": loadText,
  ".meta": loadMetaGraph,
  ".md": loadText,
  ".ori": loadOrigamiTemplate,
  ".template": loadOrigamiTemplate,
  ".txt": loadText,
  ".vfiles": loadMetaGraph,
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
        const extension = extname(key).toLowerCase();
        const loader = this.loaders[extension];
        if (loader) {
          value = await loader.call(this, value, key);
        }
      }
      return value;
    }
  };
}

/**
 * @this {Explorable}
 */
async function loadJavaScript(buffer, key) {
  const text = loadText(buffer);
  const textWithFunction = new String(text);
  const graph = this;
  const scope = graph?.scope ?? graph;

  let moduleExport;
  async function importModule() {
    if (!moduleExport) {
      moduleExport = graph.import?.(key);
    }
    return moduleExport;
  }

  /** @type {any} */ (textWithFunction).toFunction = function loadAndInvoke() {
    let fn;
    return async function (...args) {
      if (!fn) {
        fn = await importModule();
        if (
          typeof fn !== "function" &&
          typeof fn !== "string" &&
          ExplorableGraph.canCastToExplorable(fn)
        ) {
          fn = ExplorableGraph.toFunction(fn);
        }
      }
      return fn?.call(scope, ...args);
    };
  };

  /** @type {any} */ (textWithFunction).toGraph = function loadGraph() {
    let loadedGraph;
    return {
      async *[Symbol.asyncIterator]() {
        const loaded = await this.load();
        yield* loaded;
      },

      async get(key) {
        const loaded = await this.load();
        return loaded.get(key);
      },

      async load() {
        if (!loadedGraph) {
          const variant = await importModule();
          if (variant) {
            loadedGraph = ExplorableGraph.from(variant);
            if (!("parent" in loadedGraph)) {
              loadedGraph = transformObject(InheritScopeTransform, loadedGraph);
            }
            loadedGraph.parent = scope;
          }
        }
        return loadedGraph;
      },
    };
  };

  return textWithFunction;
}

/**
 * @this {Explorable}
 */
async function loadMetaGraph(buffer, key) {
  const text = loadText(buffer);
  const textWithGraph = new String(text);
  const scope = this;

  let meta;
  /** @type {any} */ (textWithGraph).toGraph = () => {
    if (!meta) {
      const graph = ExplorableGraph.from(text);
      meta = isFormulasTransformApplied(graph)
        ? graph
        : transformObject(MetaTransform, graph);
      meta.parent = scope;
    }
    return meta;
  };

  return textWithGraph;
}

/**
 * @this {Explorable}
 */
async function loadOrigamiGraph(buffer, key) {
  const text = loadText(buffer);
  const textWithGraph = new String(text);
  const scope = this;
  let graph;

  /** @type {any} */ (textWithGraph).toGraph = () => {
    if (!graph) {
      graph = new OrigamiGraph(text);
      graph.parent = scope;
    }
    return graph;
  };

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
