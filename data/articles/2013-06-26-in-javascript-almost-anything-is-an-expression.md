---
created: 2013-06-26 22:59:58
updated: 2013-12-19 13:21:00
slug: in-javascript-almost-anything-is-an-expression
title: In JavaScript, almost anything is an expression
description: Article about JavaScript expressions, operators and operator precedence.
excerpt: Actually, that’s a quote from the php.net manual, salted with a little bit of creative freedom. The same is true for JavaScript though, as is the definition of an expression as “anything that has a value”.
---

Recently, a friend asked me to explain a piece of code I use to loop a slider.

~~~ .language-javascript
i = ++i % slides.length;
~~~

I’ve been using this piece of code more than once lately, but to understand it you must know about expressions.

> In JavaScript, almost anything you write is an expression.

Actually, that’s a quote from the php.net manual, salted with a little bit of creative freedom. The same is true for JavaScript though, as is the definition of an expression as “anything that has a value”. This value can be a number (arithmetic expressions), a string, `true` or `false` (logical expressions), an object or special values like `null` and `undefined`.

## Two types of expressions

Some expressions assign a value to a variable, some don’t. The code `i + 1` is an expression that doesn’t assign a value to a variable, but the following almost equivalent expressions `i = i + 1`, `i += 1` and `i++` do. They are _almost_ equivalent because while they all increment the variable `i` by one, the values of the expressions themselves are different. You can see this for yourself if you run the following code.

~~~ .language-javascript
var i = 0;
console.log(i = i + 1); // 1
console.log(i);         // 1

var i = 0;
console.log(i += 1);    // 1
console.log(i);         // 1

var i = 0;
console.log(i++);       // 0
console.log(i);         // 1
~~~

This is where `i++` is different from `++i`. They are both expressions that increment `i` by one, but the former expression evaluates to the value of `i` before incrementing while the latter evaluates to the value of `i` after incrementing. You can easily remember this by reading the former as “give me `i`, then increment `i`” and the latter as “increment `i`, then give me `i`”.

~~~ .language-javascript
var i = 0;
console.log(++i);       // 1
console.log(i);         // 1
~~~

<p class="note--warning">An expression that assigns a value to a variable, doesn’t necessarily need to evaluate to this value itself.</p>

## Something about operators

In the examples above we’ve already seen different operators like `+`, `=` and `+=`, which are binary operators, and `++`, which is an unary operator. Binary operators require two operands, one before and one after the operator, and unary operators require one operand, either before or after the operator. There is one ternary operator, that requires three operands, the conditional operator `?:`.[^conditional-operator]

Operators can be grouped by type. For example `=` and `+=` are assignment operators, and `+` and `++` (and `%` for that matter) are arithmetic operators. There is one other operator I’d like to mention, the member operator `.` (dot). Other operators and operator types are outside the scope of this article, but if you want you can read more on [Mozilla Developer Network][mdn-operators].

Operands are expressions, which can be as simple as a constant or variable, or complex with different operators and sub-expressions. For example `i = i + 1` has two operators, so how does JavaScript know to read this as `i = (i + 1)` instead of `(i = i) + 1`? The latter is actually valid code, but it doesn’t make much sense.

## Operator precedence

The answer is operator precedence. Remember elementary school - multiplication and division go before addition and subtraction? According to some Facebook posts, there are a lot of people that are still struggling with this. Let’s clear things up: 1 + 1 * 0 is 1, not 0, because multiplication gets applied before addition. Likewise, operators in JavaScript have an order in which they are applied, the operator precedence.

For a full list see [MDN][mdn-precedence], but for now this short list (in order of precedence) of just arithmetic and arithmetic assignment operators will do:

Operator type | Individual operators
--------------|-----------------------------
member        | `.`
inc/dec       | `++` `--`
pos/neg       | `+` `-` (unary)
mul/div/mod   | `*` `/` `%`
add/sub       | `+` `-` (binary)
assignment    | `=` `+=` `-=` `*=` `/=` `%=`

So assignment comes last, which makes sense because that’s why `i = i + 1` is read as `i = (i + 1)`.

## Putting it all together

Back to the original code: `i = ++i % slides.length;`

We have four operators of which we now know the order of precedence: `.`, `++`, `%`, `=`. Let’s assume we have 4 slides and we are on the last one, so `i = 3`. Resolving operators one by one:

step         | expression                | value of i
-------------|---------------------------|-----------
             | `i = ++i % slides.length` | `i == 3`
`resolve .`  | `i = ++i % 4`             |
`resolve ++` | `i =   4 % 4`             | `i == 4`
`resolve %`  | `i =   0`                 |
`resolve =`  | `0`                       | `i == 0`

This does exactly what we want it to do, loop back to the first slide. Note that while `++i` changes the value of `i`, we aren’t using this new value. We are using the value of the expression so `(i + 1)` (between parenthesis to force precedence) would have given the same result, `++i` is just shorter. Now follow the same steps to see what happens if we are not yet on the last slide.

[^conditional-operator]:
    Read more about the conditional operator on [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator).

[mdn-operators]:  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators#Operators
[mdn-precedence]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
