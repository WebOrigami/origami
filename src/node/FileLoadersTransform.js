import path from "path";

const defaultLoaders = {
  ".css": bufferToString,
  ".htm": bufferToString,
  ".html": bufferToString,
  ".js": bufferToString,
  ".json": bufferToString,
  ".md": bufferToString,
  ".ori": async function (obj) {
    const { default: OrigamiTemplate } = await import(
      "../framework/OrigamiTemplate.js"
    );
    return new OrigamiTemplate(bufferToString(obj), this);
  },
  ".txt": bufferToString,
  ".xhtml": bufferToString,
  ".yml": bufferToString,
  ".yaml": bufferToString,
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

function bufferToString(value) {
  return value instanceof Buffer ? String(value) : value;
}
