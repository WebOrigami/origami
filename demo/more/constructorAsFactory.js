function Foo(obj) {
  const name = obj?.name ?? "world";
  if (!(this instanceof Foo)) {
    return new Foo({ name });
  } else {
    this.name = name;
  }
}

// class Foo {
//   constructor(obj) {
//     const name = obj?.name ?? "world";
//     if (!(this instanceof Foo)) {
//       return new Foo({ name });
//     } else {
//       this.name = name;
//     }
//   }
// }

const constructed1 = Foo();
const constructed2 = Foo({ name: "Alice" });
console.log(constructed1, constructed2);

const newed1 = new Foo();
const newed2 = new Foo({ name: "Bob" });
console.log(newed1, newed2);
