export default function bind(fn, ...args) {
  // @ts-ignore
  return fn.bind(this, ...args);
}

bind.usage = `bind(fn, ...args)\tBind the function to the given arguments`;
