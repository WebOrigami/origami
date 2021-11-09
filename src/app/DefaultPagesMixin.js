import DefaultValuesMixin from "../common/DefaultValuesMixin.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import defaultKeysJson from "./defaultKeysJson.js";

export default function DefaultPagesMixin(Base) {
  return class DefaultPages extends DefaultValuesMixin(Base) {
    constructor(...args) {
      super(...args);
      this.defaults = {
        ".index": defaultIndexHtml,
        ".keys.json": defaultKeysJson,
        "index.html": defaultIndexHtml,
      };
    }
  };
}
