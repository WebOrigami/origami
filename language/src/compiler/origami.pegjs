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
  downgradeReference,
  makeArray,
  makeBinaryOperation,
  makeCall,
  makeDeferredArguments,
  makeDocument,
  makeJsPropertyAccess,
  makeObject,
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
  = head:multiplicativeExpression tail:(whitespaceShell @additiveOperator whitespaceShell @multiplicativeExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

additiveOperator
  = "+"
  / "-"

angleBracketLiteral
  = "<" __ protocol:angleBracketProtocol "//"? path:angleBracketPath __ ">" {
    return annotate([protocol, ...path], location());
    }
  / "<" __ "/" path:angleBracketPath __ ">" {
      const root = annotate([ops.rootDirectory], location());
      return path.length > 0 ? annotate([root, ...path], location()) : root;
    }
  / "<" __ "~" "/"? path:angleBracketPath __ ">" {
      const home = annotate([ops.homeDirectory], location());
      return path.length > 0 ? annotate([home, ...path], location()) : home;
    }
  / "<" __ path:angleBracketPath __ ">" {
      // Angle bracket paths always reference scope
      const scope = annotate([ops.scope], location());
      return annotate([scope, ...path], location());
    }

angleBracketPath
  = @angleBracketPathKey|0.., "/"| "/"?

angleBracketPathKey
  = chars:angleBracketPathChar+ slashFollows:slashFollows? {
      // Append a trailing slash if one follows (but don't consume it)
      const key = chars.join("") + (slashFollows ? "/" : "");
      return annotate([ops.literal, key], location());
    }

// A single character in a slash-separated path segment
angleBracketPathChar
  = [^/:<>] // Much more permissive than an identifier
  / escapedChar

angleBracketProtocol
  = protocol:jsIdentifier ":" {
      return annotate([markers.global, `${protocol[1]}:`], location());
    }

arguments "function arguments"
  = parenthesesArguments
  / shellMode @pathArguments
  / jsPropertyAccess
  / computedPropertyAccess
  / optionalChaining
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
      return tail.reduce((target, args) => makeCall(target, args, options.mode), head);
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
      return annotate([markers.traverse, expression], location());
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
        downgradeReference(condition),
        downgradeReference(deferred[0]),
        downgradeReference(deferred[1])
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
    return annotate(downgradeReference(expression), location());
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
  = identifier:identifier port:(":" @integerLiteral)? slashFollows:slashFollows? {
    const portText = port ? `:${port[1]}` : "";
    const slashText = slashFollows ? "/" : "";
    const hostText = identifier + portText + slashText;
    return annotate([ops.literal, hostText], location());
  }

identifier "identifier"
  = chars:identifierChar+ { return chars.join(""); }

identifierChar
  = [^(){}\[\]<>\?!\|\-=,/:\`"'«»\\→⇒… \t\n\r] // No unescaped whitespace or special chars
  / @'-' !'>' // Accept a hyphen but not in a single arrow combination
  / escapedChar

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

jsIdentifier
  = id:$( jsIdentifierStart jsIdentifierPart* ) {
    return annotate([ops.literal, id], location());
  }

// Continuation of a JavaScript identifier
// https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-IdentifierPart
jsIdentifierPart "JavaScript identifier continuation"
  = char:. &{ return char.match(/[$_\p{ID_Continue}]/u) }

// Start of a JavaScript identifier
// https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-IdentifierStart
jsIdentifierStart "JavaScript identifier start"
  = char:. &{ return char.match(/[$_\p{ID_Start}]/u) }

jsPropertyAccess
  = __ "." __ property:jsIdentifier {
    return annotate([markers.traverse, property], location());
  }

jsReference "identifier reference"
  = id:jsIdentifier {
      return annotate([markers.reference, id], location());
    }

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
  = head:exponentiationExpression tail:(whitespaceShell @multiplicativeOperator whitespaceShell @exponentiationExpression)* {
      return tail.reduce(makeBinaryOperation, head);
    }

multiplicativeOperator
  = "*"
  / "/"
  / "%"

// A namespace reference is a string of letters only, followed by a colon.
namespace
  = chars:[A-Za-z]+ ":" {
    return annotate([markers.global, chars.join("") + ":"], location());
  }

// A new expression: `new Foo()`
newExpression
  = "new" __ head:jsReference tail:parenthesesArguments {
      const args = tail?.[0] !== undefined ? tail : [];
      return annotate([ops.construct, head, ...args], location());
    }
  / "new:" head:jsReference tail:parenthesesArguments {
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
          [ops.nullishCoalescing, downgradeReference(head), ...makeDeferredArguments(tail)],
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
      return annotate([key, reference], location());
    }
  / jseMode path:angleBracketLiteral {
    let lastKey = path.at(-1);
    if (lastKey instanceof Array) {
      lastKey = lastKey[1]; // get scope identifier or literal
    }
    return annotate([lastKey, path], location());
  }

objectPublicKey
  = identifier:identifier slash:"/"? {
      return identifier + (slash ?? "");
    }
  / string:stringLiteral {
      // Remove `ops.literal` from the string code
      return string[1];
    }

optionalChaining
  = __ "?." __ property:jsIdentifier {
    return annotate([ops.optionalTraverse, property], location());
  }
  
parameter
  = jseMode @jsIdentifier
  / shellMode identifier:identifier {
      return annotate([ops.literal, identifier], location());
    }

parameterList
  = list:parameter|1.., separator| separator? {
      return annotate(list, location());
    }

// A list with a single identifier
parameterSingleton
  = identifier:identifier {
      return annotate(
        [annotate([ops.literal, identifier], location())],
        location()
      );
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
        tail.reduce((arg, fn) => makePipeline(arg, fn, options.mode), downgradeReference(head)),
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
  / shellMode @primaryShell
  / jseMode @primaryJse

// Primary allowed in JSE mode
primaryJse
  = angleBracketLiteral
  / jsReference
  / regexLiteral

primaryShell
  = rootDirectory
  / homeDirectory
  / qualifiedReference
  / namespace
  / scopeReference

// Top-level Origami progam with possible shebang directive (which is ignored)
program "Origami program"
  = shebang? @expression

// Protocol with double-slash path: `https://example.com/index.html`
protocolExpression
  = fn:namespace "//" host:(host / slash) path:path? {
      const keys = annotate([host, ...(path ?? [])], location());
      return makeCall(fn, keys, options.mode);
    }
  / newExpression
  / primary

// A namespace followed by a key: `foo:x`
qualifiedReference
  = fn:namespace reference:scopeReference {
      return makeCall(fn, [reference[1]], options.mode);
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

// The root folder: `/`
rootDirectory
  = &("/" !"/") {
      return annotate([ops.rootDirectory], location());
    }

scopeReference "scope reference"
  = identifier:identifier slashFollows:slashFollows? {
      const id = identifier + (slashFollows ? "/" : "");
      const idCode = annotate([ops.literal, identifier], location());
      return annotate([markers.reference, idCode], location());
    }

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
      const lambdaParameters = annotate(
        [annotate([ops.literal, "_"], location())],
        location()
      );
      return annotate([ops.lambda, lambdaParameters, body], location());
    }

// A backtick-quoted template literal
templateLiteral "template literal"
  = "`" head:templateLiteralText tail:(templateSubstitution templateLiteralText)* expectBacktick {
      const op = options.mode === "jse" ? ops.templateStandard : ops.templateTree;
      return makeTemplate(op, head, tail, location());
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
  // Don't match a front matter delimiter. For some reason, the negative
  // lookahead !"--\n" doesn't work.
  / @"-" !"-\n"
  // Don't match a path that starts with a tilde: ~/foo
  / @"~" !"/"

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
