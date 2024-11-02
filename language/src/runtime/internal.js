//
// The runtime includes a number of modules with circular dependencies. This
// module exists to explicitly set the loading order for those modules. To
// enforce use of this loading order, other modules should only load the modules
// below via this module.
//
// About this pattern: https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de
//
// Note: to avoid having VS Code auto-sort the imports, keep lines between them.

export * as ops from "./ops.js";

export { default as evaluate } from "./evaluate.js";

export * as expressionFunction from "./expressionFunction.js";
