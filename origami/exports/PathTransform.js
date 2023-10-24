export default function PathTransform(Base) {
  return class Path extends Base {
    async get(key) {
      let value = await super.get(key);
      if (typeof value === "object" && value !== null) {
        // @ts-ignore
        const path = this[PathTransform.pathKey]
          ? // @ts-ignore
            `${this[PathTransform.pathKey]}/${key}`
          : key;
        value[PathTransform.pathKey] = path;
      }
      return value;
    }
  };
}

PathTransform.pathKey = Symbol("path");
