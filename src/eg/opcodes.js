// Opcodes
export const variable = Symbol("variable");
export const quote = Symbol("quote");
export const get = Symbol("get");

export const ops = {
  async [get](key) {
    return (await this.scope.get(key)) ?? (await this.graph.get(key));
  },

  async [quote](...args) {
    return String.prototype.concat(...args);
  },

  async [variable](name) {
    return this.bindings[name];
  },
};
