import Handlebars from "handlebars";
import path from "path";

export default function HandlebarsHtmlMixin(Base) {
  return class HandlebarsHtml extends Base {
    async *[Symbol.asyncIterator]() {
      const htmlKeys = new Set();
      const handlebarsKeys = new Set();
      const jsonKeys = new Set();
      for await (const key of super[Symbol.asyncIterator]()) {
        yield key;
        if (key.endsWith(".html")) {
          const htmlBase = path.basename(key, ".handlebars");
          htmlKeys.add(htmlBase);
        } else if (key.endsWith(".handlebars")) {
          const handlebarsBase = path.basename(key, ".handlebars");
          handlebarsKeys.add(handlebarsBase);
        } else if (key.endsWith(".json")) {
          const jsonBase = path.basename(key, ".json");
          jsonKeys.add(jsonBase);
        }
      }

      // Yield HTML keys if we have both .handlebars and .json keys but *not* a
      // corresponding HTML key.
      for (const key of handlebarsKeys) {
        if (jsonKeys.has(key) && !htmlKeys.has(key)) {
          yield `${key}.html`;
        }
      }
    }

    async get(...keys) {
      const value = await super.get(...keys);
      if (value !== undefined) {
        return value;
      }
      const lastKey = keys[keys.length - 1];
      if (path.extname(lastKey) === ".html") {
        const base = path.basename(lastKey, ".html");
        const handlebarsKey = `${base}.handlebars`;
        const handlebarsValue = await super.get(handlebarsKey);
        const jsonKey = `${base}.json`;
        const jsonValue = await super.get(jsonKey);
        if (handlebarsValue !== undefined && jsonValue !== undefined) {
          // Have both a .handlebars and a .json value; combine to create HTML.
          const compiled = Handlebars.compile(String(handlebarsValue));
          const data =
            typeof jsonValue === "string" || jsonValue instanceof Buffer
              ? JSON.parse(String(jsonValue))
              : jsonValue;
          const result = compiled(data);
          return result;
        }
      }
      return undefined;
    }
  };
}
