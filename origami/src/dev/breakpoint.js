import helpRegistry from "../common/helpRegistry.js";

/**
 * Break into the JavaScript debugger.
 *
 * This can be used to pause execution of the JavaScript code and inspect the
 * function argument and function target (`this`).
 *
 * @param {*} arg
 */
export default function breakpoint(arg) {
  debugger;
  return arg;
}

helpRegistry.set(
  "dev:breakpoint",
  "(a) - Break into the JavaScript debugger, then return a"
);
