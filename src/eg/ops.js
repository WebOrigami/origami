export async function get(key) {
  // We handle "." as a special case that prefers the graph over the scope.
  return key === "."
    ? this.graph
    : (await this.scope.get(key)) ?? (await this.graph.get(key));
}
get.toString = () => "«ops.get»";

export async function thisKey() {
  return this.thisKey;
}
thisKey.toString = () => "«ops.thisKey»";

export async function quote(...args) {
  return String.prototype.concat(...args);
}
quote.toString = () => "«ops.quote»";

export async function variable(name, extension) {
  if (this.bindings) {
    let result = this.bindings[name];
    if (extension) {
      result += extension;
    }
    return result;
  } else {
    return undefined;
  }
}
variable.toString = () => "«ops.variable»";
