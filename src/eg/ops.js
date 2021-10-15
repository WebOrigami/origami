export async function context() {
  return this.context;
}
context.toString = () => "«ops.context»";

export async function get(key) {
  return (await this.scope.get(key)) ?? (await this.graph.get(key));
}
get.toString = () => "«ops.get»";

export async function quote(...args) {
  return String.prototype.concat(...args);
}
quote.toString = () => "«ops.quote»";

export async function variable() {
  throw "Error: tried to execute a variable that was never bound.";
}
variable.toString = () => "«ops.variable»";
