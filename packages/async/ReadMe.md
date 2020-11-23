# Explorable functions in JavaScript

This folder contains the core JavaScript package in the explorable graph ecosystem.

Explorable functions (abbreviated as "exfns") were initially designed for use in web software development, and so the first audience of this work is aimed at browser-based or Node-based software. As a result, the packages in this repository are generally written in JavaScript and aimed at JavaScript developers (as well as developers in derivative languages, particularly TypeScript).

That said, the [concept](../Concepts/ReadMe.md) of explorable functions and its related primitives are abstract, and useful in other programming languages such as the proposed [exl](../exl/ReadMe.md) language.

## Representing explorable functions in JavaScript

The API design which follows is meant to be as idiomatic to JavaScript as possible — leveraging native features of the language in a way consistent with their intended use. While the API does take advantage of JavaScript features which are somewhat advanced, and may not yet be familiar to you, they are nevertheless useful features of the language. If you learn these features for the purpose of using explorable functions in JavaScript, you will also learn, as a consequence, aspects of the language which you can productively use elsewhere in your career.

## Duck typing of explorable functions

Explorable functions in JavaScript are recognized by "duck typing": an object is determined to be an explorable function by inspecting the presence of certain methods, rather than by inspecting the type of the object itself.

There is an `Explorable` base class that can be used to create explorable functions, and many explorable functions will be `instanceof Explorable`, but many will not.

For convenience, the `Explorable.isExplorable()` and `Explorable.isAsyncExplorable()` methods can be used to recognize arbitrary objects as having the required characteristics of an explorable function.

```js
if (Explorable.isAsyncExplorable(obj)) {
  // obj has both [Symbol.asyncIterator] and [Explorable.asyncCall] methods.
  const value = await obj[Explorable.asyncCall](key);
} else if (Explorable.isExplorable(obj)) {
  // obj has both [Symbol.iterator] and [Explorable.call] methods.
  const value = obj[Explorable.call](key);
}
```

This design is intended to facilitate the adaptation of existing JavaScript classes into the explorable graph ecosystem. By adding the required characteristics (below), you can turn almost any class you already have into an explorable function.

Note that some existing JavaScript objects like `Map` expose an iterator method with `[Symbol.iterator]`. A `Map` does not have the `[Explorable.call]` method, so will not be recognized as an exfn. Moreover, a `Map` iterator has a definition which is not basically compatible with the intended use of an exfn. However, in such cases, an object like a `Map` can be wrapped with an exfn that will both make use of the underlying `Map` implementation and expose proper exfn semantics. See later for more on wrapping.

## Required characteristics of explorable functions

An explorable function ("exfn") in JavaScript is recognized by the presence of **two** methods identified with `Symbol` objects:

1. **An iterator** identified with `[Symbol.iterator]` or `[Symbol.asyncIterator]` that returns the explorable function's public keys. Those symbols are both built into JavaScript already.
2. **A call method** identified with `[ExFn.call]` or `[Explorable.asyncCall]` that can be given a key to obtain a result. Those symbols are new, and defined by the `Explorable` class in the "@explorablegraph/explorable" package. The Explorable Graph project is interested in pursuing a [JavaScript Proposal](./JavaScript%20Proposal.md) to add compatible symbols to the JavaScript language.

If an exfn wishes to be treated as an explorable graph, it can do so by providing a third recognizable characteristic (see below).

The sync and async flavors must be used together for an exfn to be recognized: e.g., if an object defines `[Symbol.asyncIterator]`, it must also defined `[Explorable.asyncCall]` to be recognized as an explorable function. Likewise, an async exfn must define both `[Symbol.asyncIterator]` and `[Explorable.asyncCall]`.

If an object happens to define a mixture of both sync and async symbols, **the async flavor wins**: the `Explorable` operations will recognize the object as an async exfn, and will not directly invoke the sync methods (although nothing prevents you from invoking those yourself).

## Synchronous explorable functions

Synchronous explorable functions expose a `[Explorable.call]` method which takes a single parameter called the `key`. The `key` can be of any data type, but is most often a string.

```js
const exfn = {
  [Symbol.iterator]() {
    return ['a'];
  }
  [Explorable.call](key) {
    return key === 'a' ? 'A' : undefined;
  }
}

// Writes "a: A" to the console.
for (const key of exfn) {
  const value = exfn[Explorable.call](key);
  console.log(`${key}: ${value}`);
}
```

**Note:** Given that the APIs for sync and async exfns can have the same general shape and behavior, but async exfns fill a more immediate need for web development, the project is focusing on async exfns first. The API for sync exfns is not yet as complete.

## Asynchronous explorable functions

The initial intended uses of exfns in JavaScript are file-based tools, web server development, and client-side web page code — all of which generally entail asynchronous behavior.

```js
const exfn = {
  async *[Symbol.asyncIterator]() {
    yield* ['a'];
  }
  [Explorable.asyncCall](key) {
    return key === 'a' ? 'A' : undefined;
  }
}

// Writes "a: A" to the console. Note the uses of the await keyword.
for await (const key of exfn) {
  const value = await exfn[Explorable.asyncCall](key);
  console.log(`${key}: ${value}`);
}
```

## Wrapping existing objects in an explorable function

For convenience

Object

If an object already happens to support [Symbol.iterator] or [Symbol.asyncIterator] whose existing implementation cannot be changed and which is incompatible with the definition of an explorable function, you wrap the object.

e.g., Map
(Set too, I think)

## Traversal

## Explorable graphs

[Explorable.get] and [Explorable.get]
If an object supports either of those keys, it indicates that it can also be treated with graph semantics

```js
const value = await Explorable.traverse(exfn, path);
```

where path is an array of keys

functions are called, take the path as arguments:

```js
value = await exfn[Explorable.asyncCall](path);
```

graphs are traversed, get the value with the first key

```js
value = await exfn[Explorable.get](path[0]);
```

if value is exfn, traverse it with the remaining path, otherwise return it

Definition of `Explorable.traverse` is roughly

```js
class AsyncExplorable {
  static async traverse(exfn, path) {
    const get = exfn[get] || exfn[get];
    if (get) {
      // Treat exfn as a graph.
      // Invoke its "get" method with the first element of the path as a key.
      const [key, ...rest] = path;
      const value = exfn[get](key);
      // *** in condition below, real code must also check type ***
      if (Explorable.isExplorable(value)) {
        return exfn[get] ? await Explorable.traverse(value, rest) : value;
      } else {
        return value;
      }
    } else {
      // Basic explorable function.
      // Invoke its "call" method with the entire path as arguments.
      const call = exfn[asyncCall] || exfn[call];
      const value = exfn[call](...path);
      return value;
    }
  }
}
```

should work for both sync and async functions

## Explorable function types

identify by constructor
