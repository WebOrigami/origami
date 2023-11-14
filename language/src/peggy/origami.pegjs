/*

Origami expression language grammar

Regarding whitespace: Grammar rules generally assume there is no leading
whitespace. This means that rules like `expression` with many possible
productions don't have to have each production waste time looking for
whitespace. The `__` rule is used to match optional whitespace within a rule.

*/

{{
import * as ops from "../runtime/ops.js";
import { makeFunctionCall, makeObject, makeTemplate } from "./parserHelpers.js";
}}

// A block of optional whitespace
__
  = (inlineSpace / newLine / comment)*  { return ""; }

// A filesystem path that begins with a slash: `/foo/bar`
absoluteFilePath
  = path:leadingSlashPath { return [[ops.filesRoot], ...path]; }

// A chain of arguments: `(arg1)(arg2)(arg3)`
argsChain
  = parts:(parensArgs / leadingSlashPath)+ { return parts; }

// An assignment statement: `foo = 1`
assignment
  = left:identifier __ "=" __ right:expr { return [ops.assign, left, right]; }

assignmentOrShorthand
  = assignment
  / key:identifier { return [ops.assign, key, [ops.inherited, key]]; }

array
  = "[" __ list:list? "]" { return [ops.array, ...(list ?? [])]; }

// Something that can be called. This is more restrictive than the `expr`
// parser -- it doesn't accept function calls -- to avoid infinite recursion.
callTarget
  = absoluteFilePath
  / array
  / object
  / tree
  / lambda
  / protocolCall
  / group
  / scopeReference

// A single line comment
comment
  = "#" [^\n\r]* { return ""; }

digits
  = digits:[0-9]+ { return digits; }

doubleQuoteString
  = '"' chars:doubleQuoteStringChar* '"' { return chars.join(""); }

doubleQuoteStringChar
  = !('"' / newLine) char:textChar { return char; }

escapedChar
  = "\\" char:. { return char; }

// An Origami expression, no leading/trailing whitespace
expr
  // Try function calls first, as they can start with expression types that
  // follow (array, object, etc.); we want to parse the largest thing first.
  = implicitParensCall
  / functionComposition
  // Then try parsers that look for a distinctive token at the start: an opening
  // slash, bracket, curly brace, etc.
  / absoluteFilePath
  / array
  / object
  / tree
  / lambda
  / templateLiteral
  / group
  / string
  / number
  // Protocol calls are distinguished by a colon, but it's not at the start.
  / protocolCall
  // Least distinctive option is a simple scope reference, so it comes last.
  / scopeReference

// Top-level Origami expression, possible leading/trailing whitepsace.
expression
  = __ expr:expr __ { return expr; }

float
  = sign:sign? left:digits? "." right:digits {
      return parseFloat((sign ?? "") + (left?.join("") ?? "0") + "." + right.join(""));
    }

// Parse a function and its arguments, e.g. `fn(arg)`, possibly part of a chain
// of function calls, like `fn(arg1)(arg2)(arg3)`.
functionComposition
  = target:callTarget chain:argsChain { return makeFunctionCall(target, chain); }

// An expression in parentheses: `(foo)`
group
  = "(" __ expr:expr __ ")" { return expr; }

identifier
  = chars:identifierChar+ { return chars.join(""); }

identifierChar
  = [^(){}\[\],/:=\`"'\\# \t\n\r] // No unescaped whitespace or special chars
  / escapedChar

// A function call with implicit parentheses: `fn 1, 2, 3`
implicitParensCall
  = target:(functionComposition / callTarget) inlineSpace+ args:list {
    return [target, ...args];
  }

// A host identifier that may include a colon and port number: `example.com:80`.
// This is used as a special case at the head of a path, where we want to
// interpret a colon as part of a text identifier.
host
  = identifier:identifier (":" port:number)? { return text(); }

inlineSpace
  = [ \t]

integer
  = sign:sign? digits:digits {
      return parseInt((sign ?? '') + digits.join(''));
    }

// A lambda expression: `=foo()`
lambda
  = "=" __ expr:expr { return [ops.lambda, expr]; }

// A path that begins with a slash: `/foo/bar`
leadingSlashPath
  = "/" path:path { return path; }
  / "/" { return [""]; }

// A separated list of expressions
list = head:expr tail:(separator @expr)* separator? { return [head].concat(tail); }

newLine
  = "\n"
  / "\r\n"
  / "\r"

// A number
number
  = float
  / integer

// An object literal: `{foo: 1, bar: 2}`
//
// TODO: Use Object.fromEntries with array of key/value pairs
//
object
  = "{" __ properties:objectProperties? "}" { return [ops.object, properties ?? {}]; }

// A separated list of object properties or shorthands
objectProperties
  = head:objectPropertyOrShorthand tail:(separator @objectPropertyOrShorthand)* separator? __ {
    return makeObject([head].concat(tail));
  }

// A single object property with key and value: `x: 1`
objectProperty
  = key:identifier __ ":" __ value:expr { return { [key]: value }; }

objectPropertyOrShorthand
  = objectProperty
  / key:identifier { return { [key]: [ops.inherited, key] }; }

// Function arguments in parentheses
parensArgs
  = "(" __ list:list? ")" { return list ?? [undefined]; }

separator
  = __ "," __
  / whitespaceWithNewLine

sign
  = [+\-]

// A slash-separated path of keys
path
  = head:pathKey "/" tail:path { return [head].concat(tail); }
  / key:pathKey { return [key]; }

// A single key in a slash-separated path
pathKey
  = key:identifierChar* { return key.join(""); }

// Parse a protocol call like `fn://foo/bar`.
// There can be zero, one, or two slashes after the colon.
protocolCall
  = protocol:protocol ":" "/"|0..2| host:host path:leadingSlashPath? {
    return [protocol, host, ...(path ?? [])];
  }

protocol
  = reservedProtocol
  / scopeReference

reservedProtocol
  = "https" { return ops.https; }
  / "http" { return ops.http; }
  / "treehttps" { return ops.treeHttps; }
  / "treehttp" { return ops.treeHttp; }
  / "tree" { return ops.treeHttps; } // Shorthand alias

scopeReference
  = key:identifier { return [ops.scope, key]; }

singleQuoteString
  = "'" chars:singleQuoteStringChar* "'" { return chars.join(""); }

singleQuoteStringChar
  = !("'" / newLine) char:textChar { return char; }

start
  = number

string
  = doubleQuoteString
  / singleQuoteString

// A top-level document defining a template. This is the same as a template
// literal, but can contain backticks at the top level.
templateDocument
  = contents:templateDocumentContents { return [ops.lambda, contents]; }

// Template documents can contain backticks at the top level.
templateDocumentChar
  = !"{{" char:textChar { return char; }

// The contents of a template document containing plain text and substitutions
templateDocumentContents
  = parts:(templateDocumentText / templateSubstitution)* { return makeTemplate(parts); }

templateDocumentText
  = chars:templateDocumentChar+ { return chars.join(""); }

// A backtick-quoted template literal
templateLiteral
  = "`" contents:templateLiteralContents "`" { return contents; }

templateLiteralChar
  = !("`" / "{{") char:textChar { return char; }

// The contents of a template literal containing plain text and substitutions
templateLiteralContents
  = parts:(templateLiteralText / templateSubstitution)* { return makeTemplate(parts); }

// Plain text in a template literal
templateLiteralText
  = chars:templateLiteralChar+ { return chars.join(""); }

// A substitution in a template literal: `{{ fn() }}`
templateSubstitution
  = "{{" expression:expression "}}" { return expression; }

textChar
  = escapedChar / .

// A tree literal: `{ index.html = "Hello" }`
tree
  = "{" __ assignments:treeAssignments? "}" { return [ops.tree, assignments ?? {}]; }

// A separated list of assignments or shorthands
treeAssignments
  = head:assignmentOrShorthand tail:(separator @assignmentOrShorthand)* separator? __ {
    let entries = [head].concat(tail);
    //
    // TODO: Drop ops.assign
    //
    entries = entries.map(([_, key, value]) => {
      return { [key]: value };
    });
    return makeObject(entries);
  }

whitespaceWithNewLine
  = inlineSpace* comment? newLine __
