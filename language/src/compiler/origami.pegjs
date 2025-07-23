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
  makePipeline,
  makeSlashPath,
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
  = head:multiplicativeExpression tail:(whitespaceShell @additiveOperator whitespaceShell @multiplicativeExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

additiveOperator
  = "+"
  / "-"

angleBracketLiteral
  = "<" protocol:protocol "//"? path:angleBracketPath ">" {
    return annotate([protocol, ...path], location());
    }
  / "<" "/" path:angleBracketPath ">" {
      const root = annotate([ops.rootDirectory], location());
      return path.length > 0 ? annotate([root, ...path], location()) : root;
    }
  / "<" "~" "/"? path:angleBracketPath ">" {
      const home = annotate([ops.homeDirectory], location());
      return path.length > 0 ? annotate([home, ...path], location()) : home;
    }
  / "<" path:angleBracketPath ">" {
      // Angle bracket paths always reference scope
      const scope = annotate([ops.scope], location());
      return annotate([scope, ...path], location());
    }

angleBracketPath
  = @angleBracketKey|0.., "/"| "/"?

angleBracketKey
  = chars:angleBracketPathChar+ slashFollows:slashFollows? {
      // Append a trailing slash if one follows (but don't consume it)
      const key = chars.join("") + (slashFollows ? "/" : "");
      return annotate([ops.literal, key], location());
    }

// A single character in a slash-separated path segment
angleBracketPathChar
  = [^/:<>\t\n] // Much more permissive than an identifier
  / escapedChar

arguments "function arguments"
  = parenthesesArguments
  / shellMode @pathArguments
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
  = head:equalityExpression tail:(__ @bitwiseAndOperator __ @equalityExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

bitwiseAndOperator
  = @"&" !"&"

bitwiseOrExpression
  = head:bitwiseXorExpression tail:(__ @bitwiseOrOperator __ @bitwiseXorExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

bitwiseOrOperator
  = @"|" !"|"

bitwiseXorExpression
  = head:bitwiseAndExpression tail:(__ @bitwiseXorOperator __ @bitwiseAndExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

bitwiseXorOperator
  = "^"

// A function call: `fn(arg)`, possibly part of a chain of function calls, like
// `fn(arg1)(arg2)(arg3)`.
callExpression "function call"
  = head:protocolExpression tail:arguments* {
      return tail.reduce((target, args) => makeCall(target, args), head);
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
  = __ "[" expression:expression expectClosingBracket {
      return annotate([markers.property, expression], location());
    }

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

ellipsis = "..." / "…" // Unicode ellipsis

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
      error("Expected an Origami expression");
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

exponentiationExpression
  = left:unaryExpression right:(__ "**" __ @exponentiationExpression)? {
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
  = "(" expression:expression expectClosingParenthesis {
    return annotate(expression, location());
  }

guillemetString "guillemet string"
  = '«' chars:guillemetStringChar* expectGuillemet {
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
  // TODO: Deprecate
  / shellMode @"@"

implicitParenthesesCallExpression "function call with implicit parentheses"
  = head:arrowFunction args:(inlineSpace+ @implicitParensthesesArguments)? {
      return args ? makeCall(head, args, options.mode) : head;
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

jseMode
  = &{ return options.mode === "jse" }

// A key in a path or an expression that looks like one
key
  // Unambiguous key: definitely not a JavaScript identifier
  = keyUnambiguous {
      return annotate([ops.literal, text()], location());
    }
  // Ambiguous key: key or object+property reference
  / keyCharNotHyphen keyChar* {
      return annotate([markers.key, text()], location());
    }

keyChar
  // In addition to JS identifier characters, allow hyphens, periods, tildes
  = char:. &{ return char.match(/[$_\-\.~\p{ID_Continue}]/u) }

keyCharNotDigit
  // Like keyChar, but disallow digits
  = char:. &{ return char.match(/[$_\-\.~\p{ID_Continue}]/u) && !char.match(/[0-9]/) }

keyCharNotHyphen
  // Like keyChar, but disallow hyphens
  = char:. &{ return char.match(/[$_\.~\p{ID_Continue}]/u) }

keyCharNotTilde
  // Like keyChar, but disallow tildes
  = char:. &{ return char.match(/[$_\-\.\p{ID_Continue}]/u) }

// A key that can't be a JavaScript identifier
keyUnambiguous
  // Period followed by key characters: `.foo`
  = "." keyChar+
  // Digits followed by non-digit characters: `404.html`
  / digits:digits nonDigits:keyCharNotDigit+ more:keyChar*
  // Sequence with tilde not in start position: `a~b`
  / tilde:keyCharNotTilde+ "~" keyChar*
  // At sign followed by key characters: `@foo`
  // TODO: Deprecate this
  / shellMode "@" keyChar+

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

multiLineComment
  = "/*" (!"*/" .)* "*/" { return null; }

multiplicativeExpression
  = head:exponentiationExpression tail:(whitespaceShell @multiplicativeOperator whitespaceShell @exponentiationExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

multiplicativeOperator
  = "*"
  / "/"
  / "%"

// A new expression: `new Foo()`
newExpression
  = "new" __ head:key tail:parenthesesArguments? {
      const args = tail?.[0] !== undefined ? tail : [];
      return annotate([ops.construct, head, ...args], location());
    }
  / "new:" head:key tail:parenthesesArguments {
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
      const reference = annotate([markers.key, key], location());
      return annotate([key, reference], location());
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

parameterList
  = list:identifierLiteral|1.., separator| separator? {
      return annotate(list, location());
    }

// A list with a single identifier
parameterSingleton
  = param:identifierLiteral {
      return annotate([param], location());
    }

// Function arguments in parentheses
parenthesesArguments "function arguments in parentheses"
  = "(" __ list:list? __ expectClosingParenthesis {
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
      return annotate([markers.traverse, ...path], location());
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
        tail.reduce((arg, fn) => makePipeline(arg, fn, options.mode), head),
        location()
      );
    }

primary
  = numericLiteral
  / stringLiteral
  / arrayLiteral
  / objectLiteral
  / group
  / templateLiteral
  / angleBracketLiteral
  / regexLiteral
  / slashChain

// Top-level Origami progam with possible shebang directive (which is ignored)
program "Origami program"
  = shebang? @expression

propertyAccess
  = __ "." __ property:identifierLiteral {
    return annotate([markers.property, property], location());
  }

// Protocol (technically, a scheme) in a URL
// See https://datatracker.ietf.org/doc/html/rfc3986#section-3.1
protocol
  = [a-z][a-z0-9+-.]*[:] {
      return annotate([markers.global, text()], location());
    }

// Protocol with a path
protocolExpression
  = protocol:protocol "//" host:(host / slash) path:path? {
      // URL like `https://example.com/index.html`
      const keys = annotate([host, ...(path ?? [])], location());
      return makeCall(protocol, keys, options.mode);
    }
  / protocol:protocol keys:pathKey|1.., "/"| {
      // Custom protocol like `files:assets`
      return makeCall(protocol, keys, options.mode);
    }
  / newExpression
  / primary

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
  = shellMode "=" !"=" __ definition:implicitParenthesesCallExpression {
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

// A sequence of one or more dot chains separated by slashes: `a.b/x.y`
slashChain
  = keys:key|1.., slashes| trailingSlash:slashes? {
      const args = keys;
      if (trailingSlash) {
        args.push(annotate([ops.literal, ""], location()));
      }
      return makeSlashPath(args, location(), options.mode);
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
      const macroName = options.mode === "jse" ? "_template" : "@template";
      return annotate(applyMacro(front, macroName, body), location());
    }
  / front:frontMatterYaml body:templateBody {
      return makeDocument(options.mode, front, body, location());
    }
  / body:templateBody {
      if (options.front) {
        return makeDocument(options.mode, options.front, body, location());
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
  = operator:unaryOperator __ expression:unaryExpression {
      return makeUnaryOperation(operator, expression, location());
    }
  / callExpression

unaryOperator
  = "!"
  / "+"
  / "~"
  // Don't match a front matter delimiter. For some reason, the negative
  // lookahead !"--\n" doesn't work.
  / @"-" !"-\n"

whitespace
  = inlineSpace
  / newLine
  / comment

// Whitespace required in shell mode, optional in JSE mode
whitespaceShell
  = shellMode whitespace
  / jseMode __

whitespaceWithNewLine
  = inlineSpace* comment? newLine __
