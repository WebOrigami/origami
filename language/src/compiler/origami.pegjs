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
absoluteFilePath "absolute file path"
  = path:leadingSlashPath { return [[ops.filesRoot], ...path]; }

args "function arguments"
  = parensArgs
  / path:leadingSlashPath { return [ops.traverse, ...path]; }

// An assignment statement: `foo = 1`
assignment "tree assignment"
  = @identifier __ "=" __ @expr

assignmentOrShorthand
  = assignment
  / key:identifier { return [key, [ops.inherited, key]]; }

array "array"
  = "[" __ list:list? "]" { return [ops.array, ...(list ?? [])]; }

// Something that can be called. This is more restrictive than the `expr`
// parser; it doesn't accept regular function calls.
callTarget "function call"
  = absoluteFilePath
  / array
  / object
  / tree
  / lambda
  / protocolCall
  / group
  / scopeReference

// A single line comment
comment "comment"
  = "#" [^\n\r]*

digits
  = @[0-9]+

doubleQuoteString "double quote string"
  = '"' chars:doubleQuoteStringChar* '"' { return chars.join(""); }

doubleQuoteStringChar
  = !('"' / newLine) @textChar

escapedChar "backslash-escaped character"
  = "\\" @.

// An Origami expression, no leading/trailing whitespace
expr "expression"
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
  / parameterizedLambda
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

float "floating-point number"
  = sign? digits? "." digits {
      return parseFloat(text());
    }

// Parse a function and its arguments, e.g. `fn(arg)`, possibly part of a chain
// of function calls, like `fn(arg1)(arg2)(arg3)`.
functionComposition "function composition"
  // = target:callTarget chain:argsChain { return makeFunctionCall(target, chain); }
  = target:callTarget chain:args+ { return makeFunctionCall(target, chain); }

// An expression in parentheses: `(foo)`
group "parenthetical group"
  = "(" __ @expr __ ")"

identifier "identifier"
  = chars:identifierChar+ { return chars.join(""); }

identifierChar
  = [^(){}\[\]<>,/:=\`"'\\# \t\n\r] // No unescaped whitespace or special chars
  / escapedChar

identifierList
  = head:identifier tail:(separator @identifier)* separator? {
    return [head].concat(tail);
  }

// A function call with implicit parentheses: `fn 1, 2, 3`
implicitParensCall "function call with implicit parentheses"
  = target:(functionComposition / callTarget) inlineSpace+ args:list {
      return [target, ...args];
    }

// A host identifier that may include a colon and port number: `example.com:80`.
// This is used as a special case at the head of a path, where we want to
// interpret a colon as part of a text identifier.
host "HTTP/HTTPS host"
  = identifier (":" number)? { return text(); }

inlineSpace
  = [ \t]

integer "integer"
  = sign? digits {
      return parseInt(text());
    }

// A lambda expression: `=foo()`
lambda "lambda function"
  = "=" __ expr:expr { return [ops.lambda, null, expr]; }

// A path that begins with a slash: `/foo/bar`
leadingSlashPath "path with a leading slash"
  = "/" @path
  / "/" { return [""]; }

// A separated list of expressions
list "list"
  = head:expr tail:(separator @expr)* separator? { return [head].concat(tail); }

newLine
  = "\n"
  / "\r\n"
  / "\r"

// A number
number "number"
  = float
  / integer

// An object literal: `{foo: 1, bar: 2}`
//
// TODO: Use Object.fromEntries with array of key/value pairs
//
object "object literal"
  = "{" __ properties:objectProperties? "}" { return [ops.object, ...(properties ?? [])]; }

// A separated list of object properties or shorthands
objectProperties
  = head:objectPropertyOrShorthand tail:(separator @objectPropertyOrShorthand)* separator? __ {
      return [head].concat(tail);
    }

// A single object property with key and value: `x: 1`
objectProperty "object property"
  = @identifier __ ":" __ @expr

objectPropertyOrShorthand
  = objectProperty
  / key:identifier { return [key, [ops.scope, key]]; }

parameterizedLambda
  = "(" __ parameters:identifierList? ")" __ "=>" __ expr:expr {
    return [ops.lambda, parameters ?? [], expr];
  }

// Function arguments in parentheses
parensArgs "function arguments in parentheses"
  = "(" __ list:list? ")" { return list ?? [undefined]; }

separator
  = __ "," __
  / whitespaceWithNewLine

sign
  = [+\-]

// A slash-separated path of keys
path "slash-separated path"
  = head:pathKey "/" tail:path { return [head].concat(tail); }
  / key:pathKey { return [key]; }

// A single key in a slash-separated path
pathKey "path element"
  = key:identifierChar* { return key.join(""); }

// Parse a protocol call like `fn://foo/bar`.
// There can be zero, one, or two slashes after the colon.
protocolCall "function call using protocol: syntax"
  = protocol:protocol ":" "/"|0..2| host:host path:leadingSlashPath? {
      return [protocol, host, ...(path ?? [])];
    }

protocol "protocol"
  = reservedProtocol
  / scopeReference

reservedProtocol "reserved protocol"
  = "https" { return ops.https; }
  / "http" { return ops.http; }
  / "package" { return [ops.scope, "@package"] } // Alias
  / "treehttps" { return ops.treeHttps; }
  / "treehttp" { return ops.treeHttp; }
  / "tree" { return ops.treeHttps; } // Alias

scopeReference "scope reference"
  = key:identifier { return [ops.scope, key]; }

singleQuoteString "single quote string"
  = "'" chars:singleQuoteStringChar* "'" { return chars.join(""); }

singleQuoteStringChar
  = !("'" / newLine) @textChar

start
  = number

string "string"
  = doubleQuoteString
  / singleQuoteString

// A top-level document defining a template. This is the same as a template
// literal, but can contain backticks at the top level.
templateDocument "template"
  = contents:templateDocumentContents { return [ops.lambda, null, contents]; }

// Template documents can contain backticks at the top level.
templateDocumentChar
  = !"{{" @textChar

// The contents of a template document containing plain text and substitutions
templateDocumentContents
  = parts:(templateDocumentText / templateSubstitution)* { return makeTemplate(parts); }

templateDocumentText "template text"
  = chars:templateDocumentChar+ { return chars.join(""); }

// A backtick-quoted template literal
templateLiteral "template literal"
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
templateSubstitution "template substitution"
  = "{{" @expression "}}"

textChar
  = escapedChar / .

// A tree literal: `{ index.html = "Hello" }`
tree "tree literal"
  = "{" __ assignments:treeAssignments? "}" { return [ops.tree, ...(assignments ?? [])]; }

// A separated list of assignments or shorthands
treeAssignments
  = head:assignmentOrShorthand tail:(separator @assignmentOrShorthand)* separator? __ {
      return [head].concat(tail);
    }

whitespaceWithNewLine
  = inlineSpace* comment? newLine __
