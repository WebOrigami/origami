// Return a reference to Chai assert that works in the browser and in node.
import * as chai from "../node_modules/chai/chai.js";
export default typeof window === "undefined"
  ? chai.default.assert
  : // @ts-ignore
    window.chai.assert;
