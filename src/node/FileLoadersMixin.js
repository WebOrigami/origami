import path from "path";

const defaultLoaders = {
  ".css": String,
  ".hbs": String,
  ".htm": String,
  ".html": String,
  ".js": String,
  ".json": String,
  ".md": String,
  ".txt": String,
  ".xhtml": String,
  ".yml": String,
  ".yaml": String,
};

export default function FileLoadersMixin(Base) {
  return class FileLoaders extends Base {
    constructor(...args) {
      super(...args);
      this.loaders = defaultLoaders;
    }

    async get2(key) {
      let value = await super.get2(key);
      if (value instanceof Buffer) {
        const extname = path.extname(key).toLowerCase();
        const loader = this.loaders[extname];
        if (loader) {
          return loader(value);
        }
      }
      return value;
    }
  };
}
