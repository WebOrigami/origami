const hiddenKeys = Symbol("hiddenKeys");

export default function HiddenKeysTransform(Base) {
  return class HiddenKeys extends Base {
    constructor(...args) {
      super(...args);
      this[hiddenKeys] = null;
    }

    async get(key) {
      if (this[hiddenKeys] === null) {
        await this.ensureKeys();
      }
      const baseKey = this[hiddenKeys].includes(key) ? `(${key})` : key;
      return super.get(baseKey);
    }

    async getKeys() {
      this[hiddenKeys] = [];
      await super.getKeys();
    }

    async keyAdded(key, options, existingKeys) {
      const result = (await super.keyAdded?.(key, options, existingKeys)) ?? {};
      const hiddenKeyRegex = /^\((?<key>.+)\)$/;
      const match = hiddenKeyRegex.exec(key);
      if (match) {
        const hiddenKey = match.groups.key;
        this[hiddenKeys].push(hiddenKey);
        this.addKey(hiddenKey, { hidden: true });
        result.hidden = true;
      }
      return result;
    }
  };
}
