// Makes it easier to define a map whose values invoke async functions
export default function InvokeFunctionsMixin(Base) {
  return class extends Base {
    constructor(object = {}) {
      const entries = Object.entries(object);
      super(entries);
      this.log = [];
    }

    async get(key) {
      let value = await super.get(key);
      if (typeof value === "function") {
        value = await value();
      }
      this.log.push(key);
      return value;
    }
  };
}
