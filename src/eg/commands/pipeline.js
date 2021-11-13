import ExplorableGraph from "../../core/ExplorableGraph.js";

export default function pipeline(variant) {
  const graph = ExplorableGraph.from(variant);

  const result = {
    async *[Symbol.asyncIterator]() {
      const keys = await ExplorableGraph.keys(graph);
      const values = await ExplorableGraph.values(graph);
      let previous = "";
      const stepNames = keys.map((key, index) => {
        const lhs = `Step${index + 1}`;
        const itRegex = /(^|\W)(it)(\W|$)/g;
        const value = values[index];
        const rhs = value.replaceAll(itRegex, `$1${previous}$3`);
        previous = lhs;
        return `${lhs} = ${rhs}`;
      });
      yield* stepNames;
    },

    async get(key, ...rest) {
      // TODO: Parse the key for real.
      const isFormula = key.includes("=");
      return isFormula ? "" : undefined;
    },
  };

  return result;
}

pipeline.usage = `pipeline(array)\tTransform an array-like object to a series of labeled steps`;
