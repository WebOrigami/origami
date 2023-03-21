export default function newBuiltin(constructor, ...args) {
  return Reflect.construct(constructor, args);
}
