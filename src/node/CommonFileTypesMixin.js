import path from "path";
import YAML from "yaml";
import ExplorableObject from "../core/ExplorableObject.js";

const textFileExtensions = {
  ".htm": true,
  ".html": true,
  ".txt": true,
  ".xhtml": true,
};

export default function CommonFileTypesMixin(Base) {
  return class CommonFileTypes extends Base {
    async get(...keys) {
      let value = await super.get(...keys);

      const lastKey = keys[keys.length - 1];
      if (
        lastKey !== undefined &&
        (typeof value === "string" || value instanceof Buffer)
      ) {
        const extname = path.extname(lastKey).toLowerCase();
        if (extname === ".json") {
          value = JSON.parse(String(value));
          value = new ExplorableObject(value);
        } else if (extname === ".yaml") {
          value = YAML.parse(String(value));
          value = new ExplorableObject(value);
        } else if (textFileExtensions[extname]) {
          value = String(value);
        }
      }

      return value;
    }
  };
}
