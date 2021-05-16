export default function InvokeFunctionsMixin(Base) {
  return class InvokeFunctions extends Base {
    async *[Symbol.asyncIterator]() {
      yield* super[Symbol.asyncIterator]();
    }

    async get(...keys) {
      const value = await super.get(...keys);
      const result = value instanceof Function ? await value.call(this) : value;
      return result;
    }
  };
}
