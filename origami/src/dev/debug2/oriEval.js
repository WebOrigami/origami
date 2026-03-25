import ori from "../../origami/ori.js";

let mapParentToResults = new WeakMap();

export default async function oriEval(parent) {
  return async (encodedExpression) => {
    const expression = decodeURIComponent(encodedExpression);

    let lastResult = mapParentToResults.get(parent);
    if (lastResult) {
      const { expression, value } = lastResult;
      if (expression === encodedExpression) {
        return value;
      }
    }

    const value = await ori(expression, { parent });
    const result = { expression, value };
    mapParentToResults.set(parent, result);
    return value;
  };
}
