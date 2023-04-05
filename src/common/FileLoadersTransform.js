import builtinLoaders from "../builtins/@loaders.js";
import { extname, getScope } from "../core/utilities.js";

/**
 * @param {Constructor<Explorable>} Base
 */
export default function FileLoadersTransform(Base) {
  return class FileLoaders extends Base {
    constructor(...args) {
      super(...args);
      this.loaders = null;
    }

    async get(key) {
      let value = await super.get(key);
      if (value && typeof key === "string") {
        const extension = extname(key).toLowerCase().slice(1);
        if (extension) {
          const scope = getScope(this);
          if (!this.loaders) {
            // Give the scope a chance to contribute loaders, otherwise fall
            // back to the built-in loaders.
            const customLoaders = await scope.get("@loaders");
            this.loaders = customLoaders ?? builtinLoaders;
          }
          const loader = await this.loaders.get(extension);
          if (loader) {
            value = await loader.call(scope, value, key);
          }
        }
      }
      return value;
    }
  };
}
