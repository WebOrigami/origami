export async function get(key) {
  // @ts-ignore
  return await this.graph.get(key);
}
get.toString = () => "«ops.get»";

export async function implicitCall(key) {
  // @ts-ignore
  let value = await get.call(this, key);
  if (typeof value === "function") {
    // @ts-ignore
    value = await value.call(this);
  }
  return value;
}

export async function thisKey() {
  // @ts-ignore
  return this.thisKey;
}
thisKey.toString = () => "«ops.thisKey»";

export async function quote(...args) {
  return String.prototype.concat(...args);
}
quote.toString = () => "«ops.quote»";

export async function variable(name, extension) {
  // @ts-ignore
  if (this.bindings) {
    // @ts-ignore
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
