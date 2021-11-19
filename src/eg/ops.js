export async function get(key) {
  return await this.graph.get(key);
}
get.toString = () => "«ops.get»";

export async function implicitCall(key) {
  let value = await get.call(this, key);
  if (typeof value === "function") {
    value = await value.call(this);
  }
  return value;
}

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
