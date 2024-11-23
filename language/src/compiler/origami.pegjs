{{
//
// Origami language parser
//
// Generate the parser via `npm build`.
// @ts-nocheck
//

import * as ops from "../runtime/ops.js";
import {
  annotate,
  downgradeReference,
  makeArray,
  makeBinaryOperatorChain,
  makeDeferredArguments,
  makeFunctionCall,
  makeObject,
  makeReference,
  makePipeline,
  makeProperty,
  makeTemplate
} from "./parserHelpers.js";

}}

// A block of optional whitespace
__
  = (inlineSpace / newLine / comment)*  {
    return null;
  }

args "function arguments"
  = parensArgs
  / slashArgs
  / templateLiteral

array "array"
  = "[" __ entries:arrayEntries? __ closingBracket {
      return annotate(makeArray(entries ?? []), location());
    }

// A separated list of array entries
arrayEntries
  = entries:arrayEntry|1.., separator| separator? {
      return annotate(entries, location());
    }

arrayEntry
  = spread
  / pipeline

arrowFunction
  = "(" __ parameters:identifierList? __ ")" __ doubleArrow __ pipeline:pipeline {
      return annotate([ops.lambda, parameters ?? [], pipeline], location());
    }
  / conditional

// A function call: `fn(arg)`, possibly part of a chain of function calls, like
// `fn(arg1)(arg2)(arg3)`.
call "function call"
  = head:primary tail:args* {
      return tail.length === 0
        ? head
        : annotate(tail.reduce(makeFunctionCall, head), location());
    }

// Required closing curly brace. We use this for the `object` term: if the
// parser sees a left curly brace, here we must see a right curly brace.
closingBrace
  = "}"
  / .? {
      error("Expected right curly brace");
    }

// Required closing bracket
closingBracket
  = "]"
  / .? {
      error("Expected right bracket");
    }

// Required closing parenthesis. We use this for the `group` term: it's the last
// term in the `step` parser that starts with a parenthesis, so if that parser
// sees a left parenthesis, here we must see a right parenthesis.
closingParen
  = ")"
  / .? {
      error("Expected right parenthesis");
    }

// A single line comment
comment "comment"
  = multiLineComment
  / singleLineComment

conditional
  = condition:logicalOr __
    "?" __ truthy:logicalOr __
    ":" __ falsy:logicalOr
    {
      return annotate([
        ops.conditional,
        downgradeReference(condition),
        [ops.lambda, [], downgradeReference(truthy)],
        [ops.lambda, [], downgradeReference(falsy)]
      ], location());
    }
  / logicalOr
  
digits
  = @[0-9]+

doubleArrow = "⇒" / "=>"

doubleQuoteString "double quote string"
  = '"' chars:doubleQuoteStringChar* '"' {
    return annotate([ops.literal, chars.join("")], location());
  }

doubleQuoteStringChar
  = !('"' / newLine) @textChar

ellipsis = "..." / "…" // Unicode ellipsis

equality
  = head:call tail:(__ @equalityOperator __ @call)* {
      return tail.length === 0
        ? head
        : annotate(makeBinaryOperatorChain(head, tail), location());
    }

equalityOperator
  = "==="
  / "!=="
  / "=="
  / "!="

escapedChar "backslash-escaped character"
  = "\\0" { return "\0"; }
  / "\\b" { return "\b"; }
  / "\\f" { return "\f"; }
  / "\\n" { return "\n"; }
  / "\\r" { return "\r"; }
  / "\\t" { return "\t"; }
  / "\\v" { return "\v"; }
  / "\\" @.

// A top-level expression, possibly with leading/trailing whitespace
expression
  = __ @pipeline __

rootDirectory
  = "/" !"/" {
      return annotate([ops.rootDirectory], location());
    }

float "floating-point number"
  = sign? digits? "." digits {
      return annotate([ops.literal, parseFloat(text())], location());
    }

// An expression in parentheses: `(foo)`
group "parenthetical group"
  = "(" expression:expression closingParen {
      return annotate(downgradeReference(expression), location());
    }

guillemetString "guillemet string"
  = '«' chars:guillemetStringChar* '»' {
    return annotate([ops.literal, chars.join("")], location());
  }

guillemetStringChar
  = !('»' / newLine) @textChar

homeDirectory
  = "~" {
      return annotate([ops.homeDirectory], location());
    }

// A host identifier that may include a colon and port number: `example.com:80`.
// This is used as a special case at the head of a path, where we want to
// interpret a colon as part of a text identifier.
host "HTTP/HTTPS host"
  = identifier:identifier port:(":" @number)? slash:"/"? {
    const portText = port ? `:${port[1]}` : "";
    const slashText = slash ? "/" : "";
    const hostText = identifier + portText + slashText;
    return annotate([ops.literal, hostText], location());
  }

identifier "identifier"
  = chars:identifierChar+ { return chars.join(""); }

identifierChar
  = [^(){}\[\]<>\?!&\|\-=,/:\`"'«»\\ →⇒\t\n\r] // No unescaped whitespace or special chars
  / @'-' !'>' // Accept a hyphen but not in a single arrow combination
  / escapedChar

identifierList
  = list:identifier|1.., separator| separator? {
      return annotate(list, location());
    }

implicitParens "function call with implicit parentheses"
  = head:lambda args:(inlineSpace+ @implicitParensArgs)? {
      return args ? makeFunctionCall(head, args) : head;
    }
    
// A separated list of values for an implicit parens call. This differs from
// `list` in that the value term must have equal or higher precedence than
// implicit parens call -- i.e., can't be a pipeline.
implicitParensArgs
  = values:implicitParens|1.., separator| separator? {
      return annotate(values, location());
    }

inlineSpace
  = [ \t]

integer "integer"
  = sign? digits {
      return annotate([ops.literal, parseInt(text())], location());
    }

// A lambda expression: `=foo(_)`
lambda "lambda function"
  // Avoid a following equal sign (for an equality)
  = "=" !"=" __ definition:pipeline {
      return annotate([ops.lambda, ["_"], definition], location());
    }
  / arrowFunction
    
// A separated list of values
list "list"
  = values:pipeline|1.., separator| separator? {
      return annotate(values, location());
    }

literal
  = number
  / string

logicalAnd
  = head:equality tail:(__ "&&" __ @equality)* {
      return tail.length === 0
        ? head
        : annotate(
          [ops.logicalAnd, downgradeReference(head), ...makeDeferredArguments(tail)],
          location()
        );
    }

logicalOr
  = head:nullishCoalescing tail:(__ "||" __ @nullishCoalescing)* {
      return tail.length === 0
        ? head
        : annotate(
          [ops.logicalOr, downgradeReference(head), ...makeDeferredArguments(tail)],
          location()
        );
    }

multiLineComment
  = "/*" (!"*/" .)* "*/" { return null; }

// A namespace reference is a string of letters only, followed by a colon.
// For the time being, we also allow a leading `@`, which is deprecated.
namespace
  = at:"@"? chars:[A-Za-z]+ ":" {
    return annotate([ops.builtin, (at ?? "") + chars.join("") + ":"], location());
  }

newLine
  = "\n"
  / "\r\n"
  / "\r"

// A number
number "number"
  = float
  / integer

nullishCoalescing
  = head:logicalAnd tail:(__ "??" __ @logicalAnd)* {
      return tail.length === 0
        ? head
        : annotate(
          [ops.nullishCoalescing, downgradeReference(head), ...makeDeferredArguments(tail)],
          location()
        );
    }

// An object literal: `{foo: 1, bar: 2}`
object "object literal"
  = "{" __ entries:objectEntries? __ closingBrace {
      return annotate(makeObject(entries ?? [], ops.object), location());
    }

// A separated list of object entries
objectEntries
  = entries:objectEntry|1.., separator| separator? {
      return annotate(entries, location());
    }

objectEntry
  = spread
  / objectProperty
  / objectGetter
  / objectShorthandProperty

// A getter definition inside an object literal: `foo = 1`
objectGetter "object getter"
  = key:objectKey __ "=" __ pipeline:pipeline {
      return annotate(
        makeProperty(key, annotate([ops.getter, pipeline], location())),
        location()
      );
    }

objectHiddenKey
  = hiddenKey:("(" objectPublicKey ")") { return hiddenKey.join(""); }

objectKey "object key"
  = objectHiddenKey
  / objectPublicKey

// A property definition in an object literal: `x: 1`
objectProperty "object property"
  = key:objectKey __ ":" __ pipeline:pipeline {
      return annotate(makeProperty(key, pipeline), location());
    }

// A shorthand reference inside an object literal: `foo`
objectShorthandProperty "object identifier"
  = key:objectPublicKey {
      return annotate([key, [ops.inherited, key]], location());
    }

objectPublicKey
  = identifier:identifier slash:"/"? {
    return identifier + (slash ?? "");
  }
  / string:string {
    // Remove `ops.literal` from the string code
    return string[1];
  }

// Function arguments in parentheses
parensArgs "function arguments in parentheses"
  = "(" __ list:list? __ ")" {
      return annotate(list ?? [undefined], location());
    }

// A slash-separated path of keys
path "slash-separated path"
  // Path with at least a tail
  = head:pathElement|0..| tail:pathTail {
      let path = tail ? [...head, tail] : head;
      // Remove parts for consecutive slashes
      path = path.filter((part) => part[1] !== "/");
      return annotate(path, location());
    }
  // Path with slashes, maybe no tail
  / head:pathElement|1..| tail:pathTail? {
      let path = tail ? [...head, tail] : head;
      // Remove parts for consecutive slashes
      path = path.filter((part) => part[1] !== "/");
      return annotate(path, location());
  }

// A path key followed by a slash
pathElement
  = chars:pathKeyChar* "/" {
    return annotate([ops.literal, chars.join("") + "/"], location());
  }

// A single character in a slash-separated path.
pathKeyChar
  // This is more permissive than an identifier. It allows some characters like
  // brackets or quotes that are not allowed in identifiers.
  = [^(){}\[\],:/\\ \t\n\r]
  / escapedChar

// A path key without a slash
pathTail
  = chars:pathKeyChar+ {
    return annotate([ops.literal, chars.join("")], location());
  }

// A pipeline that starts with a value and optionally applies a series of
// functions to it.
pipeline
  = head:implicitParens tail:(__ singleArrow __ @implicitParens)* {
      return tail.reduce(makePipeline, downgradeReference(head));
    }

primary
  = literal
  / array
  / object
  / group
  / templateLiteral
  / reference

// Top-level Origami progam with possible shebang directive (which is ignored)
program "Origami program"
  = shebang? @expression

// A namespace with a double-slash path: `https://example.com/index.html`
protocolPath
  = fn:namespace "//" host:host path:path? {
      return annotate(
        makeFunctionCall(fn, [host, ...(path ?? [])]),
        location()
      );
    }

// A namespace followed by a key: `foo:x`
qualifiedReference
  = fn:namespace head:pathTail {
      return annotate(makeFunctionCall(fn, [head]), location());
    }

reference
  = topDirectory
  / rootDirectory
  / homeDirectory
  / qualifiedReference
  / namespace
  / scopeReference

scopeReference "scope reference"
  = identifier:identifier {
      return annotate(makeReference(identifier), location());
    }

separator
  = __ "," __
  / whitespaceWithNewLine

shebang
  = "#!" [^\n\r]* { return null; }

sign
  = [+\-]

singleArrow
  = "→"
  / "->"

singleLineComment
  = "//" [^\n\r]* { return null; }

singleQuoteString "single quote string"
  = "'" chars:singleQuoteStringChar* "'" {
    return annotate([ops.literal, chars.join("")], location());
  }

singleQuoteStringChar
  = !("'" / newLine) @textChar

// A path that begins with a slash: `/foo/bar`
slashArgs "path with a leading slash"
  = "/" path:path? {
      return annotate([ops.traverse, ...(path ?? [])], location());
    }

spread
  = ellipsis value:conditional {
      return annotate([ops.spread, value], location());
    }

start
  = number

string "string"
  = doubleQuoteString
  / singleQuoteString
  / guillemetString

// A top-level document defining a template. This is the same as a template
// literal, but can contain backticks at the top level.
templateDocument "template"
  = contents:templateDocumentContents {
      return annotate([ops.lambda, ["_"], contents], location());
    }

// Template documents can contain backticks at the top level.
templateDocumentChar
  = !("${") @textChar

// The contents of a template document containing plain text and substitutions
templateDocumentContents
  = head:templateDocumentText tail:(templateSubstitution templateDocumentText)* {
      return annotate(makeTemplate(ops.template, head, tail), location());
    }

templateDocumentText "template text"
  = chars:templateDocumentChar* {
      return chars.join("");
    }

// A backtick-quoted template literal
templateLiteral "template literal"
  = "`" contents:templateLiteralContents "`" {
      return annotate(makeTemplate(ops.template, contents[0], contents[1]), location());
    }

templateLiteralChar
  = !("`" / "${") @textChar

// The contents of a template literal containing plain text and substitutions
templateLiteralContents
  = head:templateLiteralText tail:(templateSubstitution templateLiteralText)*

// Plain text in a template literal
templateLiteralText
  = chars:templateLiteralChar* {
      return chars.join("");
    }

// A substitution in a template literal: `${x}`
templateSubstitution "template substitution"
  = "${" expression:expression "}" {
      return annotate(expression, location());
    }

textChar
  = escapedChar
  / .
 
// A folder at the root of the filesystem
topDirectory
  = "/" key:pathTail {
      return annotate([ops.rootDirectory, key], location());
    }

whitespaceWithNewLine
  = inlineSpace* comment? newLine __
