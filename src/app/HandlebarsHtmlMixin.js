import Handlebars from "handlebars";
import path from "path";
import YAML from "yaml";
import ExplorableGraph from "../core/ExplorableGraph.js";
import * as utilities from "../core/utilities.js";

export default function HandlebarsHtmlMixin(Base) {
  return class HandlebarsHtml extends Base {
    async *[Symbol.asyncIterator]() {
      // const keys = new Set();
      // const handlebarsKeys = new Set();
      // const jsonKeys = new Set();
      // const yamlKeys = new Set();
      for await (const key of super[Symbol.asyncIterator]()) {
        yield key;
        // keys.add(key);
        if (key.endsWith(".hbs")) {
          const generatedKey = path.basename(key, ".hbs");
          // handlebarsKeys.add(handlebarsBase);
          // keys.add(generatedKey);
          yield generatedKey;
        }
        // else if (key.endsWith(".json")) {
        //   const jsonBase = path.basename(key, ".json");
        //   jsonKeys.add(jsonBase);
        // } else if (key.endsWith(".yaml")) {
        //   const yamlBase = path.basename(key, ".yaml");
        //   yamlKeys.add(yamlBase);
        // }
      }

      // Yield HTML keys if we have both .handlebars and .json/.yaml keys but
      // *not* a corresponding HTML key.
      // for (const key of handlebarsKeys) {
      //   if ((jsonKeys.has(key) || yamlKeys.has(key)) && !htmlKeys.has(key)) {
      //     yield `${key}.html`;
      //   }
      // }
    }

    async get(...keys) {
      const value = await super.get(...keys);
      if (value !== undefined) {
        return value;
      }
      const lastKey = keys[keys.length - 1];
      const handlebarsKey = `${lastKey}.hbs`;
      const handlebarsValue = await super.get(handlebarsKey);
      if (handlebarsValue === undefined) {
        return undefined;
      }
      let handlebarsTemplate = String(handlebarsValue);

      // See if the template contains front matter we can use as data.
      let data = utilities.extractFrontMatter(handlebarsTemplate);
      if (data) {
        handlebarsTemplate = data.content;
      } else {
        // No front matter; look for separate .json or .yaml file.
        const jsonKey = `${lastKey}.json`;
        const yamlKey = `${lastKey}.yaml`;
        const dataValue =
          (await super.get(jsonKey)) ?? (await super.get(yamlKey));
        if (dataValue) {
          data =
            typeof dataValue === "string" || dataValue instanceof Buffer
              ? YAML.parse(String(dataValue))
              : ExplorableGraph.canCastToExplorable(dataValue)
              ? await ExplorableGraph.plain(dataValue)
              : dataValue;
        }
      }
      if (data) {
        // Have both a .handlebars and a .json value; combine to create HTML.
        const compiled = Handlebars.compile(handlebarsTemplate);
        const result = compiled(data);
        return result;
      }

      return undefined;
    }
  };
}
