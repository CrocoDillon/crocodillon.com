---
created: 2015-11-28 18:56:00
slug: asynchronous-callbacks-in-koa
title: Asynchronous callbacks in Koa
description: Trying to send an asynchronous response in Koa but all you get is “Error: Can't set headers after they are sent.”?
excerpt: Koa is an awesome framework created by the team behind Express. Unlike Express however, in Koa if you simply try to set the response body asynchronously you get an “Can't set headers after they are sent.” error.
---

<p class="intro">Koa is an awesome framework created by the team behind Express. Unlike Express however, in Koa if you simply try to set the response body asynchronously you get an “Can't set headers after they are sent.” error.</p>

I’ve been there and couldn’t easily find what I did wrong so decided to write down the solution. Keep in mind though, in Koa 2 everything will be different again.

## Differences between Express and Koa

In Express, sending an asynchronous response (for example after fetching data from an API) is as simple as:

~~~ .language-javascript
var app = require('express')();

app.use(function (req, res) {
  setTimeout(() => {
    res.send('Hello asynchronous world!');
  }, 100);
});

app.listen(3000);
~~~

In Koa you can try the same thing basically:

~~~ .language-javascript
const app = require('koa')();

app.use(function* () {
  setTimeout(() => {
    this.body = 'Hello asynchronous world!';
  }, 100);
});

app.listen(3000);
~~~

But that would get you not much more than “Error: Can't set headers after they are sent.”. This error message is the result of Koa’s default 404 response when your middleware didn’t alter the response.

## Yielding promises with co

Koa uses the co[^co] library to wrap middleware. With co you can yield all kind of objects from a generator, for example a promise[^promise]. We can use this to create an asynchronous callback that works:

~~~ .language-javascript
const app = require('koa')();

app.use(function* () {
  yield new Promise((resolve, reject) => {
    setTimeout(() => {
      this.body = 'Hello asynchronous world!';
      resolve();
    }, 100);
  });
});

app.listen(3000);
~~~

In this case we create the promise ourselves but this works as well with promises from other libraries. An example with axios[^axios]:

~~~ .language-javascript
const axios = require('axios');
const app = require('koa')();

app.use(function* () {
  yield axios.get('/something').then((response) => {
    this.body = response;
  }).catch((error) => {
    this.status = 404;
  });
});

app.listen(3000);
~~~

## Changes in Koa 2

Soon there will be Koa 2, which is currently in alpha. One of the changes most significant to writing asynchronous callbacks is that co is no longer supplied with Koa. You can still wrap your generator functions yourself though:

~~~ .language-javascript
const Koa = require('koa');
const co = require('co');

const app = new Koa();

app.use(co.wrap(function* (ctx, next) {
  yield new Promise((resolve, reject) => {
    setTimeout(() => {
      ctx.body = 'Hello asynchronous world!';
      resolve();
    }, 100);
  });
}));

app.listen(3000);
~~~

As you can see there are quite some other changes in Koa 2, but let’s not digress.

You can also use an async[^async] function, but those are not supported in Node yet so you need something like Babel (with stage-3 preset) to compile that code into something that Node does understand. For completeness, this is what such a function would look like:

~~~ .language-javascript
const Koa = require('koa');

const app = new Koa();

app.use(async (ctx, next) => {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      ctx.body = 'Hello asynchronous world!';
      resolve();
    }, 100);
  });
});

app.listen(3000);
~~~

Koa 2 added asynchronous examples to the README meaning this article will one day be obsolete. Until then, I hope it can help prevent some headaches!

[^co]:
    [co](https://www.npmjs.com/package/co) is based on generators and used to handle the control flow in Koa... for now.
[^promise]:
    [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are used to represent an asynchronous operation that may or may not have already been completed.
[^axios]:
    [axios](https://www.npmjs.com/package/axios) is a promise based HTTP client that works in Node and the browser. Nice to have in your toolkit until the fetch API is well supported.
[^async]:
    Async functions (ES7) are not yet very well supported but some day they will be and apparently they are so brilliant [Jake Archibald wants to marry them](https://jakearchibald.com/2014/es7-async-functions/).
