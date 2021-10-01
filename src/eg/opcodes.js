/**
 * We define a class to represent our opcodes so that we can customize their
 * JSON string representation, which can be helpful when debugging.
 */
class OpCode {
  #name;

  constructor(name) {
    this.#name = name;
  }

  toJSON() {
    return `«${this.#name}»`;
  }
}

export const variable = new OpCode("variable");
export const quote = new OpCode("quote");
