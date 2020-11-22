Explorable functions could form the organizing information model of a programming language.
Consider a language with Lisp syntax based on explorable functions.

```lisp
(exfn a b c)
```

A C-style language (including an evolved JavaScript) would write this as

```c
exfn(a, b, c);
```

These both mean to ask explorable function exfn for the object with key (a b c). In current JavaScript, this project expresses the C-style call as:

```js
exfn[apply]([a b, c ]);
```

## Declaration

The language needs a syntax for defining the following elements for an explorable function:

- Name (`exfn`, above): the key that will be used to register the exfn in an explorable namespace (graph) of defined functions. This makes the defined exfn available to other functions.
- A graph that declares the exfn's keys/members:
  - Public keys, if any, and their implementation.
  - A public key which returns the exfn's public keys.
  - Hidden keys, if any, and their implementation.

## Map

Defining an exfn to map lowercase letters to uppercase letters might look like:

```js
lowerToUpper = {
  a: "A",
  b: "B",
  c: "C",
};
```

This defines an exfn with the name `lowerToUpper` with the public keys `['a', 'b', 'c']`.

The language needs some syntax for unique symbols as a key. Perhaps we introduce `#keys` to mean such a unique symbol. In this language, we can get the public keys for an object:

```js
lowerToUpper.#keys; // Returns ['a', 'b', 'c']
```

Who defines `#keys`? The exfn definition above is implicitly composed with a definition for the base explorable function object/class/definition.

## Functions

Defining an exfn to add numbers in a C-style language might look like:

```js
add = {
  (a, b) => a + b,
};
```

This defines a graph with no public keys. The `#keys` key returns an exfn `[]` (always returns `undefined`, no public keys itself).

### Lisp

```lisp
(define add
  (lambda
    (a b) (+ a b)
  )
)
```

## Invocation equals traversal

Invoking a method on an exfn — or, alternatively, traversing the graph it defines — is a matter of traversing the graph expressed by the exfn.

Using the example `add` definitions above, the invocation `add(1, 2) or `(add 1 2)` means: traverse the`add` graph with a tuple`(1, 2)`. The `add` definition responds with the sum of the numbers.

## Data structures

Many common data structures can be represented as explorable functions: arrays, lists, trees, strings.

The language must provide an intrinsic exfn definition that provides a way to modify a graph at runtime.

## Object-oriented programming

Object-oriented concepts can be expressed by composition of declaration graphs: nodes in the declaration graph for exfn `A` can point to other declaration graphs. If `A` incorporate's exfn `B`'s graph, A can be said to inherit from B.

A common pattern is to have a key represent a tuple `(method ...args)`.

A `String` class as an explorable function:

```js
String = {
  append: (s) => { /* Calculate value + s, set that as new value. */ },
  length: () => { /* get length */ },
  value: null,
})
```

Given this representation, a variable of type string is an exfn that composes the definitions of `String`.

```js
message = Explorable.compose(
  {
    value: "Hello",
  },
  String
);
```

Here, `compose(a, b)` returns a new graph that composes subgraphs a and b. The resulting exfn will search in graph a for key first, and if not found will look in graph b. The `compose` operation also composes the `#keys` of the subgraphs.

One can then make invocations such as:

```js
message.value; // "Hello"
message.length; // 5
message.definition; // Returns message's definitions, including those of String
```

## Operations

The package of Explorable intrinsics in this project are written in JavaScript, but the algorithms behind them are universal and inherently portable to explorable functions implemented in any language. That is, any language built around explorable functions would also pick up a well-defined set of useful operations.

## Intrinsics
