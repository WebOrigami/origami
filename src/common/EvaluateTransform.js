import Expression from "../language/Expression.js";

export default function EvaluateTransform(Base) {
  return class Evaluate extends Base {
    async get(key) {
      let value = await super.get(key);
      if (value instanceof Expression) {
        const scope = this.scope ?? this;
        value = await value.evaluate(scope);
      }
      return value;
    }
  };
}
