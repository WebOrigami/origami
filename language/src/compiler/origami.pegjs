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
  applyMacro,
  makeArray,
  makeBinaryOperation,
  makeCall,
  makeDeferredArguments,
  makeDocument,
  makeObject,
  makePath,
  makePipeline,
  makeTemplate,
  makeUnaryOperation,
  makeYamlObject,
  markers,
} from "./parserHelpers.js";
import isOrigamiFrontMatter from "./isOrigamiFrontMatter.js";

}}

// A block of optional whitespace
__
  = whitespace*  {
    return null;
  }

additiveExpression
  = head:multiplicativeExpression tail:(whitespace @additiveOperator whitespace @multiplicativeExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

additiveOperator
  = "+"
  / minus

angleBracketLiteral
  = "<" scheme:uriScheme "//"? path:angleBracketPath ">" {
    return annotate([scheme, ...path], location());
    }
  / "</" path:angleBracketPath ">" {
      const external = annotate([markers.external, "/"], location());
      return annotate([markers.traverse, external, ...path], location());
    }
  / "<" path:angleBracketPath ">" {
      const [head, ...tail] = path;
      const external = annotate([markers.external, head[1]], location());
      return annotate([markers.traverse, external, ...tail], location());
    }

angleBracketPath
  = @angleBracketKey|0.., "/"| "/"?

// Single key in an angle bracket path, possibly with a trailing slash
angleBracketKey
  = chars:angleBracketPathChar+ slashFollows:slashFollows? {
      // Append a trailing slash if one follows (but don't consume it)
      const key = chars.join("") + (slashFollows ? "/" : "");
      return annotate([ops.literal, key], location());
    }

// A single character in an angle bracket key
angleBracketPathChar
  // Accept anything that doesn't end the angle bracket key or path
  = [^/>\t\n\r]
  / escapedChar

arguments "function arguments"
  = parenthesesArguments
  / pathArguments
  / propertyAccess
  / computedPropertyAccess
  // / optionalChaining
  / templateLiteral

arrayLiteral "array"
  = "[" __ entries:arrayEntries? __ expectClosingBracket {
      return makeArray(entries ?? [], location());
    }

// A separated list of array entries
arrayEntries
  = entries:arrayEntry|1.., separator| separator? {
      return annotate(entries, location());
    }

arrayEntry
  = spreadElement
  / pipelineExpression
  // JavaScript treats a missing value as `undefined`
  / __ !"]" {
      return annotate([ops.literal, undefined], location());
    }

arrowFunction
  = "(" __ parameters:parameterList? __ ")" __ doubleArrow __ pipeline:expectPipelineExpression {
      const lambdaParameters = parameters ?? annotate([], location());
      return annotate([ops.lambda, lambdaParameters, pipeline], location());
    }
  / parameter:parameterSingleton __ doubleArrow __ pipeline:expectPipelineExpression {
      return annotate([ops.lambda, parameter, pipeline], location());
    }
  / conditionalExpression

bitwiseAndExpression
  = head:equalityExpression tail:(whitespace @bitwiseAndOperator whitespace @equalityExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

bitwiseAndOperator
  = @"&" !"&"

bitwiseOrExpression
  = head:bitwiseXorExpression tail:(whitespace @bitwiseOrOperator whitespace @bitwiseXorExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

bitwiseOrOperator
  = @"|" !"|"

bitwiseXorExpression
  = head:bitwiseAndExpression tail:(whitespace @bitwiseXorOperator whitespace @bitwiseAndExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

bitwiseXorOperator
  = "^"

// A function call: `fn(arg)`, possibly part of a chain of function calls, like
// `fn(arg1)(arg2)(arg3)`.
callExpression "function call"
  = head:uriExpression tail:arguments* {
      return tail.reduce(
        (target, args) => makeCall(target, args, location()),
        head
      );
    }

// A comma-separated list of expressions: `x, y, z`
commaExpression
  // The commas are required, but the list can have a single item.
  = list:pipelineExpression|1.., __ "," __ | {
      return list.length === 1
        ? list[0]
        : annotate([ops.comma, ...list], location());
    }

// A single line comment
comment "comment"
  = multiLineComment
  / singleLineComment

computedPropertyAccess
  = computedPropertySpace "[" expression:expectExpression expectClosingBracket {
      return annotate([markers.property, expression], location());
    }

// A space before a computed property access. This is allowed when in not in
// shell mode, but not in shell mode. In shell mode `foo [bar]` should parse as
// a function call with a single argument of an array, not as a property access.
computedPropertySpace
  = shellMode
  / !shellMode __

conditionalExpression
  = condition:logicalOrExpression tail:(__
    "?" __ @shorthandFunction __
    ":" __ @shorthandFunction)?
    {
      if (!tail) {
        return condition;
      }
      const deferred = makeDeferredArguments(tail);
      return annotate([
        ops.conditional,
        condition,
        deferred[0],
        deferred[1]
      ], location());
    }
  
digits
  = @[0-9]+

doubleArrow = "⇒" / "=>"

doubleQuoteString "double quote string"
  = '"' chars:doubleQuoteStringChar* expectDoubleQuote {
    return annotate([ops.literal, chars.join("")], location());
  }

doubleQuoteStringChar
  = !('"' / newLine) @textChar

ellipsis = "..."

equalityExpression
  = head:relationalExpression tail:(__ @equalityOperator __ @relationalExpression)* {
      return tail.reduce(makeBinaryOperation, head);
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

expectBacktick
  = "`"
  / .? {
      error("Expected closing backtick");
    }

expectClosingBrace
  = "}"
  / .? {
      error(`An object ended without a closing brace, or contained something that wasn't expected.\nThe top level of an object can only contain definitions ("a: b" or "a = b") or spreads ("...a").`);
    }

expectClosingBracket
  = "]"
  / .? {
      error("Expected right bracket");
    }

expectClosingParenthesis
  = ")"
  / .? {
      error("Expected right parenthesis");
    }

expectDoubleQuote
  = '"'
  / .? {
      error("Expected closing quote");
    }

expectExpression
  = expression
  / .? {
      error("Expected an expression");
    }

expectFrontDelimiter
  = frontDelimiter
  / .? {
      error("Expected \"---\"");
    }

expectGuillemet
  = '»'
  / .? {
      error("Expected closing guillemet");
    }

expectSingleQuote
  = "'"
  / .? {
      error("Expected closing quote");
    }

// Required expression
expectPipelineExpression
  = pipelineExpression
  / .? {
      error("Expected an expression");
    }

expectUnaryExpression
  = unaryExpression
  / .? {
      error("Expected an expression");
    }

exponentiationExpression
  = left:unaryExpression right:(whitespace "**" whitespace @exponentiationExpression)? {
      return right ? annotate([ops.exponentiation, left, right], location()) : left;
    }

// A top-level expression, possibly with leading/trailing whitespace
expression
  = __ @commaExpression __

floatLiteral "floating-point number"
  = digits? "." digits {
      return annotate([ops.literal, parseFloat(text())], location());
    }

// Marker for the beginning or end of front matter
frontDelimiter
  = "---\n"

// Origami front matter
frontMatterExpression
  // If we detect Origami front matter, we need to see an expression
  = frontDelimiter &{
    return isOrigamiFrontMatter(input.slice(location().end.offset))
  } @expectExpression expectFrontDelimiter

frontMatterText
  = chars:( !frontDelimiter @. )* {
    return chars.join("");
  }

frontMatterYaml "YAML front matter"
  = frontDelimiter yaml:frontMatterText frontDelimiter {
    return makeYamlObject(yaml, location());
  }

// An expression in parentheses: `(foo)`
group "parenthetical group"
  = "(" expression:expectExpression expectClosingParenthesis {
    return annotate(expression, location());
  }

guillemetString "guillemet string"
  = '«' chars:guillemetStringChar* expectGuillemet {
    return annotate([ops.literal, chars.join("")], location());
  }

guillemetStringChar
  = !('»' / newLine) @textChar

// A host identifier that may include a colon and port number: `example.com:80`.
// This is used as a special case at the head of a path, where we want to
// interpret a colon as part of a text identifier.
host "HTTP/HTTPS host"
  = name:hostname port:(":" @integerLiteral)? slashFollows:slashFollows? {
      const portText = port ? `:${port[1]}` : "";
      const slashText = slashFollows ? "/" : "";
      const host = name + portText + slashText;
      return annotate([ops.literal, host], location());
    }

hostname
  = key {
    return text();
  }

// JavaScript-compatible identifier
identifier
  = id:$( identifierStart identifierPart* ) {
    return id;
  }

// Identifier as a literal
identifierLiteral
  = id:identifier {
      return annotate([ops.literal, id], location());
    }

// Continuation of a JavaScript identifier
// https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-IdentifierPart
identifierPart "JavaScript identifier continuation"
  = char:. &{ return char.match(/[$_\p{ID_Continue}]/u) }

// Start of a JavaScript identifier
// https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-IdentifierStart
identifierStart "JavaScript identifier start"
  = char:. &{ return char.match(/[$_\p{ID_Start}]/u) }

implicitParenthesesCallExpression "function call with implicit parentheses"
  = head:arrowFunction args:(inlineSpace+ @implicitParensthesesArguments)? {
      return args ? makeCall(head, args, location()) : head;
    }
    
// A separated list of values for an implicit parens call. This differs from
// `list` in that the value term can't be a pipeline.
implicitParensthesesArguments
  = shellMode values:shorthandFunction|1.., separator| separator? {
      return annotate(values, location());
    }

inlineSpace
  = [ \t]

integerLiteral "integer"
  = digits {
      return annotate([ops.literal, parseInt(text())], location());
    }

// A key in a path or an expression that looks like one
key
  = keyCharStart keyChar* {
    return text();
  }

// Character after the first in a key
keyChar
  = keyCharStart
  // Also allow some math operators (not slash)
  / "!"
  / "+"
  / minus
  / "*"
  / "%"
  / "&"
  / "|"
  / "^"

// First character in a key
keyCharStart
  // All JS identifier characters
  = char:. &{ return char.match(/[$_\p{ID_Continue}]/u) }
  / "."
  / "~"
  / "@"

// A separated list of values
list "list"
  = values:pipelineExpression|1.., separator| separator? {
      return annotate(values, location());
    }

logicalAndExpression
  = head:bitwiseOrExpression tail:(__ "&&" __ @bitwiseOrExpression)* {
      return tail.length === 0
        ? head
        : annotate(
          [ops.logicalAnd, head, ...makeDeferredArguments(tail)],
          location()
        );
    }

logicalOrExpression
  = head:nullishCoalescingExpression tail:(__ "||" __ @nullishCoalescingExpression)* {
      return tail.length === 0
        ? head
        : annotate(
          [ops.logicalOr, head, ...makeDeferredArguments(tail)],
          location()
        );
    }

// Unary or binary minus operator
minus
  // Don't match a front matter delimiter or pipeline operator. For some reason,
  // the negative lookahead !"--\n" doesn't work.
  = @"-" !"-\n" !">"

multiLineComment
  = "/*" (!"*/" .)* "*/" { return null; }

multiplicativeExpression
  = head:exponentiationExpression tail:(whitespace @multiplicativeOperator whitespace @exponentiationExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

multiplicativeOperator
  = "*"
  / "/"
  / "%"

// A new expression: `new Foo()`
newExpression
  = "new" __ head:pathLiteral tail:parenthesesArguments? {
      const args = tail?.[0] !== undefined ? tail : [];
      return annotate([ops.construct, head, ...args], location());
    }
  / "new:" head:pathLiteral tail:parenthesesArguments {
      const args = tail?.[0] !== undefined ? tail : [];
      return annotate([ops.construct, head, ...args], location());
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
          [ops.nullishCoalescing, head, ...makeDeferredArguments(tail)],
          location()
        );
    }

// An object literal: `{foo: 1, bar: 2}`
objectLiteral "object literal"
  = "{" __ entries:objectEntries? __ expectClosingBrace {
      return makeObject(entries ?? [], location());
    }

// A separated list of object entries
objectEntries
  = entries:objectEntry|1.., separator| separator? {
      return annotate(entries, location());
    }

objectEntry
  = spreadElement
  / objectProperty
  / objectGetter
  / objectShorthandProperty

// A getter definition inside an object literal: `foo = 1`
objectGetter "object getter"
  = key:objectKey __ "=" __ pipeline:expectPipelineExpression {
      const getter = annotate([ops.getter, pipeline], location());
      return annotate([key, getter], location());
    }

objectHiddenKey
  = hiddenKey:("(" objectPublicKey ")") { return hiddenKey.join(""); }

objectKey "object key"
  = objectHiddenKey
  / objectPublicKey

// A property definition in an object literal: `x: 1`
objectProperty "object property"
  = key:objectKey __ ":" __ pipeline:expectPipelineExpression {
      return annotate([key, pipeline], location());
    }

// A shorthand reference inside an object literal: `foo`
objectShorthandProperty "object identifier"
  = key:objectPublicKey {
      const reference = annotate([markers.reference, key], location());
      const traverse = annotate([markers.traverse, reference], location());
      return annotate([key, traverse], location());
    }
  / path:angleBracketLiteral {
    let lastKey = path.at(-1);
    if (lastKey instanceof Array) {
      lastKey = lastKey[1]; // get scope identifier or literal
    }
    return annotate([lastKey, path], location());
  }

objectPublicKey
  = key:key slash:"/"? {
    return text();
  }
  / string:stringLiteral {
      // Remove `ops.literal` from the string code
      return string[1];
    }

optionalChaining
  = __ "?." __ property:identifier {
    return annotate([ops.optionalTraverse, property], location());
  }

// Name of a unction parameter
parameter
  = key:key {
      return annotate([ops.literal, key], location());
    }

parameterList
  = list:parameter|1.., separator| separator? {
      return annotate(list, location());
    }

// A list with a single identifier
parameterSingleton
  = param:parameter {
      return annotate([param], location());
    }

// Function arguments in parentheses
parenthesesArguments "function arguments in parentheses"
  = "(" __ list:list? __ expectClosingParenthesis {
      return annotate(list ?? [undefined], location());
    }

// A slash-separated path of keys that follows a call target, such as the path
// after the slash in `(x)/y/z`
pathArguments
  = "/" keys:pathKeys? {
      const args = keys ?? [];
      return annotate([markers.traverse, ...args], location());
    }

// Sequence of keys that may each have trailing slashes
pathKeys
  = pathSegment|1..|
  
// A path without angle brackets
pathLiteral
  = keys:pathKeys {
      return makePath(keys);
    }

// A path key with an optional trailing slash
pathSegment
  = key:key "/"? {
      return annotate([ops.literal, text()], location());
    }
  // A single slash is a path key
  / "/" {
      return annotate([ops.literal, text()], location());
    }

// A pipeline that starts with a value and optionally applies a series of
// functions to it.
pipelineExpression
  = head:shorthandFunction tail:(__ singleArrow __ @shorthandFunction)* {
      return annotate(
        tail.reduce((arg, fn) => makePipeline(arg, fn, location()), head),
        location()
      );
    }

primary
  // The following start with distinct characters
  = stringLiteral
  / arrayLiteral
  / objectLiteral
  / group
  / angleBracketLiteral
  / regexLiteral
  / templateLiteral

  // These are more ambiguous
  / @numericLiteral !keyChar // numbers + chars would be a key
  / pathLiteral

// Top-level Origami progam with possible shebang directive (which is ignored)
program "Origami program"
  = shebang? @expression

programMode
  = &{ return options.mode === "program" }

propertyAccess
  = whitespaceOptionalForProgram "." whitespaceOptionalForProgram property:identifierLiteral {
    return annotate([markers.property, property], location());
  }

regexFlags
  = flags:[gimuy]* {
      return flags.join("");
    }

regexLiteral
  = "/" chars:regexLiteralChar* "/" flags:regexFlags? {
      const regex = new RegExp(chars.join(""), flags);
      return annotate([ops.literal, regex], location());
    }

regexLiteralChar
  = [^/\n\r] // No unescaped slashes or newlines
  / escapedChar

relationalExpression
  // We disallow a newline before the relational operator to support a newline
  // as a separator in an object literal that has an object shorthand property
  // with an angle bracket path. Otherwise the opening angle bracket would be
  // interpreted as a relational operator.
  = head:shiftExpression tail:(inlineSpace @relationalOperator __ @shiftExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

relationalOperator
  = "<="
  / "<"
  / ">="
  / ">"

separator
  = __ "," __
  / @whitespaceWithNewLine

shebang
  = "#!" [^\n\r]* { return null; }

shellMode
  = &{ return options.mode === "shell" }

shiftExpression
  = head:additiveExpression tail:(__ @shiftOperator __ @additiveExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

shiftOperator
  = "<<"
  / ">>>"
  / ">>"

// A shorthand lambda expression: `=foo(_)`
shorthandFunction "lambda function"
  // Avoid a following equal sign (for an equality)
  = (shellMode / programMode) "=" !"=" __ definition:implicitParenthesesCallExpression {
      if (options.mode === "program") {
        console.warn("Warning: the shorthand function syntax is deprecated in Origami programs. Use arrow syntax instead.");
      }
      const lambdaParameters = annotate(
        [annotate([ops.literal, "_"], location())],
        location()
      );
      return annotate([ops.lambda, lambdaParameters, definition], location());
    }
  / implicitParenthesesCallExpression

singleArrow
  = "→"
  / "->"

singleLineComment
  = "//" [^\n\r]* { return null; }

singleQuoteString "single quote string"
  = "'" chars:singleQuoteStringChar* expectSingleQuote {
    return annotate([ops.literal, chars.join("")], location());
  }

singleQuoteStringChar
  = !("'" / newLine) @textChar

// Used for an initial slash in a protocol expression
slash
  = slashFollows {
    return annotate([ops.literal, "/"], location());
  }

// One or more consecutive slashes
slashes
  = "/"+ {
      return annotate([ops.literal, "/"], location());
    }

// Check whether next character is a slash without consuming input
slashFollows
  // This expression returned `undefined` if successful; we convert to `true`
  = &"/" {
      return true;
    }

spreadElement
  = ellipsis __ value:expectPipelineExpression {
      return annotate([ops.spread, value], location());
    }

stringLiteral "string"
  = doubleQuoteString
  / singleQuoteString
  / shellMode @guillemetString

// The body of a template document is a kind of template literal that can
// contain backticks at the top level.
templateBody "template"
  = head:templateBodyText tail:(templateSubstitution templateBodyText)* {
      return makeTemplate(ops.templateIndent, head, tail, location());
    }

// Template document bodies can contain backticks at the top level
templateBodyChar
  = !("${") @textChar

templateBodyText "template text"
  = chars:templateBodyChar* {
      return annotate([ops.literal, chars.join("")], location());
    }

templateDocument "template document"
  = front:frontMatterExpression __ body:templateBody {
      return annotate(applyMacro(front, "_template", body), location());
    }
  / front:frontMatterYaml body:templateBody {
      return makeDocument(front, body, location());
    }
  / body:templateBody {
      if (options.front) {
        return makeDocument(options.front, body, location());
      }
      const lambdaParameters = annotate(
        [annotate([ops.literal, "_"], location())],
        location()
      );
      return annotate([ops.lambda, lambdaParameters, body], location());
    }

// A backtick-quoted template literal
templateLiteral "template literal"
  = "`" head:templateLiteralText tail:(templateSubstitution templateLiteralText)* expectBacktick {
      return makeTemplate(ops.templateTree, head, tail, location());
    }

templateLiteralChar
  = !("`" / "${") @textChar

// Plain text in a template literal
templateLiteralText
  = chars:templateLiteralChar* {
      return annotate([ops.literal, chars.join("")], location());
    }

// A substitution in a template literal: `${x}`
templateSubstitution "template substitution"
  = "${" expression:expectExpression "}" {
      return annotate(expression, location());
    }

textChar
  = escapedChar
  / .

// A unary prefix operator: `!x`
unaryExpression
  = operator:unaryOperator __ expression:expectUnaryExpression {
      return makeUnaryOperation(operator, expression, location());
    }
  / callExpression

// URI
uri
  // Double slashes after colon: `https://example.com/index.html`
  = scheme:uriScheme "//" host:host path:("/" uriPath)? {
      const rest = path ? path[1] : [];
      const keys = annotate([host, ...rest], location());
      return makeCall(scheme, keys, location());
    }
  // No slashes after colon: `files:assets`
  / scheme:uriScheme keys:pathKeys {
      return makeCall(scheme, keys, location());
    }

// URI expression
uriExpression
  = uri
  / newExpression
  / primary

// A single key in a path, possibly with trailing slash: `a/`, `b`
uriKey
  = chars:uriKeyChar+ "/"? {
      return annotate([ops.literal, text()], location());
    }
  / "/" {
    // A single slash is a path key
    return annotate([ops.literal, ""], location());
    }

// A single character in a URI key
uriKeyChar
  // Accept anything that doesn't end the URI key or path
  // Reject whitespace; see notes for `whitespace` term
  = char:[^/,\)\]\}] !&{ return /\s/.test(char); } { return char; }
  / escapedChar

// A slash-separated path of keys: `a/b/c`
uriPath "slash-separated path"
  = keys:uriKey|1..| {
      return annotate(keys, location());
    }

// URI scheme, commonly called a protocol
// See https://datatracker.ietf.org/doc/html/rfc3986#section-3.1
uriScheme
  = [a-z][a-z0-9+-.]*[:] {
      return annotate([markers.global, text()], location());
    }

unaryOperator
  = "!"
  / "+"
  / @"~" ![\/\)\]\}]  // don't match `~/` or end of term
  / minus

whitespace
  = (whitespaceChar / comment)+

whitespaceChar
  // JavaScript considers a large number of characters whitespace so we use the
  // `/s` definition to avoid missing any.
  = char:. &{ return /\s/.test(char); } { return char; }

// In some cases whitespace isn't allowed in shell mode but is allowed in
// program mode
whitespaceOptionalForProgram
  = programMode __
  / shellMode

whitespaceWithNewLine
  = inlineSpace* comment? newLine __
