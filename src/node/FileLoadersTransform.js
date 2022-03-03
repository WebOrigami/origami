import path from "path";
import HandlebarsTemplate from "../app/HandlebarsTemplate.js";
import PikaTemplate from "../app/PikaTemplate.js";

const defaultLoaders = {
  ".css": bufferToString,
  ".hbs": function (obj) {
    return new HandlebarsTemplate(bufferToString(obj), this);
  },
  ".htm": bufferToString,
  ".html": bufferToString,
  ".js": bufferToString,
  ".json": bufferToString,
  ".md": bufferToString,
  ".pkt": function (obj) {
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
          value = loader.call(this, value);
        }
      }
      return value;
    }
  };
}

function bufferToString(value) {
  return value instanceof Buffer ? String(value) : value;
}
