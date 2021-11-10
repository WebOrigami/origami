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
    #loaders = defaultLoaders;

    async get(...keys) {
      let value = await super.get(...keys);
      const lastKey = keys[keys.length - 1];
      if (lastKey !== undefined && value instanceof Buffer) {
        const extname = path.extname(lastKey).toLowerCase();
        const loader = this.loaders[extname];
        if (loader) {
          return loader(value);
        }
      }
      return value;
    }

    get loaders() {
      return this.#loaders;
    }
    set loaders(loaders) {
      this.#loaders = loaders;
    }
  };
}
