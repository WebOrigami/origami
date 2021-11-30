import path from "path";
import HandlebarsTemplate from "../app/HandlebarsTemplate.js";

const defaultLoaders = {
  ".css": bufferToString,
  ".hbs": (obj) => new HandlebarsTemplate(bufferToString(obj)),
  ".htm": bufferToString,
  ".html": bufferToString,
  ".js": bufferToString,
  ".json": bufferToString,
  ".md": bufferToString,
  ".txt": bufferToString,
  ".xhtml": bufferToString,
  ".yml": bufferToString,
  ".yaml": bufferToString,
};

export default function FileLoadersMixin(Base) {
  return class FileLoaders extends Base {
    constructor(...args) {
      super(...args);
      this.loaders = defaultLoaders;
    }

    async get(key) {
      let value = await super.get(key);
      if (value) {
        const extname = path.extname(key).toLowerCase();
        const loader = this.loaders[extname];
        if (loader) {
          value = loader(value);
        }
      }
      return value;
    }
  };
}

function bufferToString(value) {
  return value instanceof Buffer ? String(value) : value;
}
