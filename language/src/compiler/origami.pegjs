{{
//
// Origami language parser
//
// This generally follows the pattern of the JavaScript expression grammar at
// https://github.com/pegjs/pegjs/blob/master/examples/javascript.pegjs. Like
// that parser, this one uses the ECMAScript grammar terms where relevant.
//
// Generate the parser via `npm build`.
//
// @ts-nocheck
//

import * as ops from "../runtime/ops.js";
import {
  annotate,
  downgradeReference,
  makeArray,
  makeBinaryOperation,
  makeCall,
  makeDeferredArguments,
  makeObject,
  makePipeline,
  makeProperty,
  makeReference,
  makeTemplate,
  makeUnaryOperation
} from "./parserHelpers.js";

}}

// A block of optional whitespace
__
  = (inlineSpace / newLine / comment)*  {
    return null;
  }

additiveExpression
  = head:multiplicativeExpression tail:(__ @additiveOperator __ @multiplicativeExpression)* {
      return annotate(tail.reduce(makeBinaryOperation, head), location());
    }

additiveOperator
  = "+"
  / "-"

arguments "function arguments"
  = parenthesesArguments
  / pathArguments
  / templateLiteral

arrayLiteral "array"
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
  / pipelineExpression
  // JavaScript treats a missing value as `undefined`
  / __ !"]" {
      return annotate([ops.literal, undefined], location());
    }

arrowFunction
  = "(" __ parameters:identifierList? __ ")" __ doubleArrow __ pipeline:pipelineExpression {
      return annotate([ops.lambda, parameters ?? [], pipeline], location());
    }
  / identifier:identifier __ doubleArrow __ pipeline:pipelineExpression {
      return annotate([ops.lambda, [identifier], pipeline], location());
    }
  / conditionalExpression

bitwiseAndExpression
  = head:equalityExpression tail:(__ @bitwiseAndOperator __ @equalityExpression)* {
      return annotate(tail.reduce(makeBinaryOperation, head), location());
    }

bitwiseAndOperator
  = @"&" !"&"

bitwiseOrExpression
  = head:bitwiseXorExpression tail:(__ @bitwiseOrOperator __ @bitwiseXorExpression)* {
      return annotate(tail.reduce(makeBinaryOperation, head), location());
    }

bitwiseOrOperator
  = @"|" !"|"

bitwiseXorExpression
  = head:bitwiseAndExpression tail:(__ @bitwiseXorOperator __ @bitwiseAndExpression)* {
      return annotate(tail.reduce(makeBinaryOperation, head), location());
    }

bitwiseXorOperator
  = "^"

// A function call: `fn(arg)`, possibly part of a chain of function calls, like
// `fn(arg1)(arg2)(arg3)`.
callExpression "function call"
  = head:protocolExpression tail:arguments* {
      return annotate(tail.reduce(makeCall, head), location());
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
closingParenthesis
  = ")"
  / .? {
      error("Expected right parenthesis");
    }

// A single line comment
comment "comment"
  = multiLineComment
  / singleLineComment

conditionalExpression
  = condition:logicalOrExpression __
    "?" __ truthy:pipelineExpression __
    ":" __ falsy:pipelineExpression
    {
      return annotate([
        ops.conditional,
        downgradeReference(condition),
        [ops.lambda, [], downgradeReference(truthy)],
        [ops.lambda, [], downgradeReference(falsy)]
      ], location());
    }
  / logicalOrExpression
  
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

equalityExpression
  = head:relationalExpression tail:(__ @equalityOperator __ @relationalExpression)* {
      return annotate(tail.reduce(makeBinaryOperation, head), location());
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

exponentiationExpression
  = left:unaryExpression __ "**" __ right:exponentiationExpression {
      return annotate([ops.exponentiation, left, right], location());
    }
  / unaryExpression

// A top-level expression, possibly with leading/trailing whitespace
expression
  = __ @pipelineExpression __

floatLiteral "floating-point number"
  = digits? "." digits {
      return annotate([ops.literal, parseFloat(text())], location());
    }

// An expression in parentheses: `(foo)`
group "parenthetical group"
  = "(" expression:expression closingParenthesis {
      return annotate(downgradeReference(expression), location());
    }

guillemetString "guillemet string"
  = '«' chars:guillemetStringChar* '»' {
    return annotate([ops.literal, chars.join("")], location());
  }

guillemetStringChar
  = !('»' / newLine) @textChar

// The user's home directory: `~`
homeDirectory
  = "~" {
      return annotate([ops.homeDirectory], location());
    }

// A host identifier that may include a colon and port number: `example.com:80`.
// This is used as a special case at the head of a path, where we want to
// interpret a colon as part of a text identifier.
host "HTTP/HTTPS host"
  = identifier:identifier port:(":" @integerLiteral)? slashFollows:slashFollows? {
    const portText = port ? `:${port[1]}` : "";
    const slashText = slashFollows ? "/" : "";
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

implicitParenthesesCallExpression "function call with implicit parentheses"
  = head:arrowFunction args:(inlineSpace+ @implicitParensthesesArguments)? {
      return args ? makeCall(head, args) : head;
    }
    
// A separated list of values for an implicit parens call. This differs from
// `list` in that the value term can't be a pipeline.
implicitParensthesesArguments
  = values:shorthandFunction|1.., separator| separator? {
      return annotate(values, location());
    }

inlineSpace
  = [ \t]

integerLiteral "integer"
  = digits {
      return annotate([ops.literal, parseInt(text())], location());
    }
    
// A separated list of values
list "list"
  = values:pipelineExpression|1.., separator| separator? {
      return annotate(values, location());
    }

literal
  = numericLiteral
  / stringLiteral

logicalAndExpression
  = head:bitwiseOrExpression tail:(__ "&&" __ @bitwiseOrExpression)* {
      return tail.length === 0
        ? head
        : annotate(
          [ops.logicalAnd, downgradeReference(head), ...makeDeferredArguments(tail)],
          location()
        );
    }

logicalOrExpression
  = head:nullishCoalescingExpression tail:(__ "||" __ @nullishCoalescingExpression)* {
      return tail.length === 0
        ? head
        : annotate(
          [ops.logicalOr, downgradeReference(head), ...makeDeferredArguments(tail)],
          location()
        );
    }

multiLineComment
  = "/*" (!"*/" .)* "*/" { return null; }

multiplicativeExpression
  = head:exponentiationExpression tail:(__ @multiplicativeOperator __ @exponentiationExpression)* {
      return annotate(tail.reduce(makeBinaryOperation, head), location());
    }

multiplicativeOperator
  = "*"
  / "/"
  / "%"

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
numericLiteral "number"
  = floatLiteral
  / integerLiteral

nullishCoalescingExpression
  = head:logicalAndExpression tail:(__ "??" __ @logicalAndExpression)* {
      return tail.length === 0
        ? head
        : annotate(
          [ops.nullishCoalescing, downgradeReference(head), ...makeDeferredArguments(tail)],
          location()
        );
    }

// An object literal: `{foo: 1, bar: 2}`
objectLiteral "object literal"
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
  = key:objectKey __ "=" __ pipeline:pipelineExpression {
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
  = key:objectKey __ ":" __ pipeline:pipelineExpression {
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
  / string:stringLiteral {
    // Remove `ops.literal` from the string code
    return string[1];
  }

// Function arguments in parentheses
parenthesesArguments "function arguments in parentheses"
  = "(" __ list:list? __ ")" {
      return annotate(list ?? [undefined], location());
    }

// A slash-separated path of keys: `a/b/c`
path "slash-separated path"
  // Path with at least a tail
  = segments:pathSegment|1..| {
      // Drop empty segments that represent consecutive or final slashes
      segments = segments.filter(segment => segment);
      return annotate(segments, location());
    }

// A slash-separated path of keys that follows a call target
pathArguments
  = path:path {
      return annotate([ops.traverse, ...path], location());
    }

// A single key in a slash-separated path: `/a`
pathKey
  = chars:pathSegmentChar+ slashFollows:slashFollows? {
    // Append a trailing slash if one follows (but don't consume it)
    const key = chars.join("") + (slashFollows ? "/" : "");
    return annotate([ops.literal, key], location());
  }

pathSegment
  = "/" @pathKey?

// A single character in a slash-separated path segment
pathSegmentChar
  // This is more permissive than an identifier. It allows some characters like
  // brackets or quotes that are not allowed in identifiers.
  = [^(){}\[\],:/\\ \t\n\r]
  / escapedChar

// A pipeline that starts with a value and optionally applies a series of
// functions to it.
pipelineExpression
  = head:shorthandFunction tail:(__ singleArrow __ @shorthandFunction)* {
      return annotate(
        tail.reduce(makePipeline, downgradeReference(head)),
        location()
      );
    }

primary
  = literal
  / arrayLiteral
  / objectLiteral
  / group
  / templateLiteral
  / reference

// Top-level Origami progam with possible shebang directive (which is ignored)
program "Origami program"
  = shebang? @expression

// Protocol with double-slash path: `https://example.com/index.html`
protocolExpression
  = fn:namespace "//" host:host path:path? {
      const keys = annotate([host, ...(path ?? [])], location());
      return annotate(makeCall(fn, keys), location());
    }
  / primary

// A namespace followed by a key: `foo:x`
qualifiedReference
  = fn:namespace reference:scopeReference {
      const literal = annotate([ops.literal, reference[1]], reference.location);
      return annotate(makeCall(fn, [literal]), location());
    }

reference
  = rootDirectory
  / homeDirectory
  / qualifiedReference
  / namespace
  / scopeReference

relationalExpression
  = head:shiftExpression tail:(__ @relationalOperator __ @shiftExpression)* {
      return annotate(tail.reduce(makeBinaryOperation, head), location());
    }

relationalOperator
  = "<="
  / "<"
  / ">="
  / ">"

// A top-level folder below the root: `/foo`
// or the root folder itself: `/`
rootDirectory
  = "/" key:pathKey {
      return annotate([ops.rootDirectory, key], location());
    }
  / "/" !"/" {
      return annotate([ops.rootDirectory], location());
    }

scopeReference "scope reference"
  = identifier:identifier slashFollows:slashFollows? {
      const id = identifier + (slashFollows ? "/" : "");
      return annotate(makeReference(id), location());
    }

separator
  = __ "," __
  / whitespaceWithNewLine

// Check whether next character is a slash without consuming input
slashFollows
  // This expression returned `undefined` if successful; we convert to `true`
  = &"/" {
      return true;
    }

shebang
  = "#!" [^\n\r]* { return null; }

shiftExpression
  = head:additiveExpression tail:(__ @shiftOperator __ @additiveExpression)* {
      return annotate(tail.reduce(makeBinaryOperation, head), location());
    }

shiftOperator
  = "<<"
  / ">>>"
  / ">>"

// A shorthand lambda expression: `=foo(_)`
shorthandFunction "lambda function"
  // Avoid a following equal sign (for an equality)
  = "=" !"=" __ definition:implicitParenthesesCallExpression {
      return annotate([ops.lambda, ["_"], definition], location());
    }
  / implicitParenthesesCallExpression

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

spread
  = ellipsis __ value:conditionalExpression {
      return annotate([ops.spread, value], location());
    }

stringLiteral "string"
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

// A unary prefix operator: `!x`
unaryExpression
  = operator:unaryOperator __ expression:unaryExpression {
      return annotate(makeUnaryOperation(operator, expression), location());
    }
  / callExpression

unaryOperator
  = "!"
  / "+"
  / "-"
  / "~"

whitespaceWithNewLine
  = inlineSpace* comment? newLine __
