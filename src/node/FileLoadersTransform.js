import path from "path";

const defaultLoaders = {
  ".css": bufferToString,
  ".hbs": async function (obj) {
    const HandlebarsTemplate = await import("../app/HandlebarsTemplate.js");
    return new HandlebarsTemplate(bufferToString(obj), this);
  },
  ".htm": bufferToString,
  ".html": bufferToString,
  ".js": bufferToString,
  ".json": bufferToString,
  ".md": bufferToString,
  ".pkt": async function (obj) {
    const PikaTemplate = await import("../app/PikaTemplate.js");
    return new PikaTemplate(bufferToString(obj), this);
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
      if (value && typeof key === "string") {
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
