export default function newBuiltin(constructor, ...args) {
  return Reflect.construct(constructor, args);
}

newBuiltin.usage = "@new <classFn>\tCreate a new instance of the given class";
newBuiltin.documentation = "https://weborigami.org/language/@new.html";
