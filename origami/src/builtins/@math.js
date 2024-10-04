export function add(...args) {
  const numbers = args.map((arg) => Number(arg));
  return numbers.reduce((acc, val) => acc + val, 0);
}

export function subtract(a, b) {
  return Number(a) - Number(b);
}

export function multiply(...args) {
  const numbers = args.map((arg) => Number(arg));
  return numbers.reduce((acc, val) => acc * val, 1);
}

export function divide(a, b) {
  return Number(a) / Number(b);
}
