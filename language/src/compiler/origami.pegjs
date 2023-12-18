{{
//
// Origami language parser
//
// Generate the parser via `npm build`.
// @ts-nocheck
//

import * as ops from "../runtime/ops.js";
import { makeFunctionCall, makeTemplate } from "./parserHelpers.js";
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
  = @identifier __ "=" __ @expr

assignmentOrShorthand
  = assignment
  / key:identifier { return [key, [ops.inherited, key]]; }

array
  = "[" __ list:list? "]" { return [ops.array, ...(list ?? [])]; }

// Something that can be called. This is more restrictive than the `expr`
// parser; it doesn't accept regular function calls.
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
  = "#" [^\n\r]*

digits
  = @[0-9]+

doubleQuoteString
  = '"' chars:doubleQuoteStringChar* '"' { return chars.join(""); }

doubleQuoteStringChar
  = !('"' / newLine) @textChar

escapedChar
  = "\\" @.

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
expression "Origami expression"
  = __ @expr __

float
  = sign? digits? "." digits {
      return parseFloat(text());
    }

// Parse a function and its arguments, e.g. `fn(arg)`, possibly part of a chain
// of function calls, like `fn(arg1)(arg2)(arg3)`.
functionComposition
  = target:callTarget chain:argsChain { return makeFunctionCall(target, chain); }

// An expression in parentheses: `(foo)`
group
  = "(" __ @expr __ ")"

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
  = identifier (":" number)? { return text(); }

inlineSpace
  = [ \t]

integer
  = sign? digits {
      return parseInt(text());
    }

// A lambda expression: `=foo()`
lambda
  = "=" __ expr:expr { return [ops.lambda, expr]; }

// A path that begins with a slash: `/foo/bar`
leadingSlashPath
  = "/" @path
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
  = "{" __ properties:objectProperties? "}" { return [ops.object, ...(properties ?? [])]; }

// A separated list of object properties or shorthands
objectProperties
  = head:objectPropertyOrShorthand tail:(separator @objectPropertyOrShorthand)* separator? __ {
      return [head].concat(tail);
    }

// A single object property with key and value: `x: 1`
objectProperty
  = @identifier __ ":" __ @expr

objectPropertyOrShorthand
  = objectProperty
  / key:identifier { return [key, [ops.scope, key]]; }

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
  = !("'" / newLine) @textChar

start
  = number

string
  = doubleQuoteString
  / singleQuoteString

// A top-level document defining a template. This is the same as a template
// literal, but can contain backticks at the top level.
templateDocument "Origami template"
  = contents:templateDocumentContents { return [ops.lambda, contents]; }

// Template documents can contain backticks at the top level.
templateDocumentChar
  = !"{{" @textChar

// The contents of a template document containing plain text and substitutions
templateDocumentContents
  = parts:(templateDocumentText / templateSubstitution)* { return makeTemplate(parts); }

templateDocumentText
  = chars:templateDocumentChar+ { return chars.join(""); }

// A backtick-quoted template literal
templateLiteral
  = "`" @templateLiteralContents "`"

templateLiteralChar
  = !("`" / "{{") @textChar

// The contents of a template literal containing plain text and substitutions
templateLiteralContents
  = parts:(templateLiteralText / templateSubstitution)* { return makeTemplate(parts); }

// Plain text in a template literal
templateLiteralText
  = chars:templateLiteralChar+ { return chars.join(""); }

// A substitution in a template literal: `{{ fn() }}`
templateSubstitution
  = "{{" @expression "}}"

textChar
  = escapedChar / .

// A tree literal: `{ index.html = "Hello" }`
tree
  = "{" __ assignments:treeAssignments? "}" { return [ops.tree, ...(assignments ?? [])]; }

// A separated list of assignments or shorthands
treeAssignments
  = head:assignmentOrShorthand tail:(separator @assignmentOrShorthand)* separator? __ {
      return [head].concat(tail);
    }

whitespaceWithNewLine
  = inlineSpace* comment? newLine __
