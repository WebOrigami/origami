const hiddenKeys = Symbol("hiddenKeys");
import { literal } from "../language/parse.js";

export default function HiddenKeysTransform(Base) {
  return class HiddenKeys extends Base {
    constructor(...args) {
      super(...args);
      this[hiddenKeys] = null;
    }

    async get(key) {
      let value = await super.get(key);
      if (value === undefined) {
        // Is the key a hidden key?
        if (this[hiddenKeys] === null) {
          await this.ensureKeys();
        }
        if (this[hiddenKeys].includes(key)) {
          const keyWithParens = `(${key})`;
          value = await super.get(keyWithParens);
        }
      }
      return value;
    }

    async getKeys() {
      this[hiddenKeys] = [];
      await super.getKeys();
    }

    async keyAdded(key, options, existingKeys) {
      const result = (await super.keyAdded?.(key, options, existingKeys)) ?? {};
      if (key.startsWith("(") && key.endsWith(")")) {
        const text = key.slice(1, -1);
        const parsed = literal(text);
        if (parsed && parsed.rest === "") {
          this[hiddenKeys].push(text);
          this.addKey(text, { hidden: true });
          result.hidden = true;
        }
      }
      return result;
    }

    onChange(key) {
      super.onChange?.(key);
      this[hiddenKeys] = null;
    }
  };
}
