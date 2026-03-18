import ori from "../../origami/ori.js";

let lastExpression;
let lastResult;

export default async function oriEval(parent) {
  return async (encodedExpression) => {
    console.log(encodedExpression);
    const expression = decodeURIComponent(encodedExpression);
    if (expression === lastExpression) {
      return lastResult;
    }
    lastExpression = expression;
    lastResult = await ori(expression, { parent });
    return lastResult;
  };
}
