function Foo(obj) {
  const target = new.target;
  if (!target) {
    return new Foo(obj);
  }
  this.name = obj?.name ?? "world";
}
Foo.prototype = {};

const foo1 = Foo();
const foo2 = Foo({ name: "Alice" });

const newFoo1 = new Foo();
const newFoo2 = new Foo({ name: "Bob" });

// console.log(foo1, foo2, newFoo1, newFoo2);

class Bar extends Foo {}

const newBar1 = new Bar();
const newBar2 = new Bar({ name: "Bob" });

console.log(newBar1, newBar2);
console.log(newBar1 instanceof Bar);
console.log(newBar1 instanceof Foo);
