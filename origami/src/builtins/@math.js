export function add(...args) {
  return args.reduce((acc, val) => acc + val, 0);
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(...args) {
  return args.reduce((acc, val) => acc * val, 1);
}

export function divide(a, b) {
  return a / b;
}
