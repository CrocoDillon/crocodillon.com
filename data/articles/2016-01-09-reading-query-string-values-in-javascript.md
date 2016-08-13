---
created: 2016-01-09 13:28:00
slug: reading-query-string-values-in-javascript
title: Reading query string values in JavaScript
description: To get anything useful from window.location.search you need to parse it in JavaScript to get individual values.
excerpt: To get anything useful from `window.location.search` you need to parse it in JavaScript to get individual values.
---

<p class="intro">Most server software can read values from the query string easily, but sometimes you need to read these values in the browser using JavaScript.</p>

The `window.location` object contains some handy information about whatever you may have in your browser’s address bar. For example if you would visit `https://www.example.com/some/resource?foo=bar&q=baz`, you will get this object:

~~~ .language-javascript
JSON.stringify(window.location, null, 2);
// =>
{
  "hash": "",
  "search": "?foo=bar&q=baz",
  "pathname": "/some/resource",
  "port": "",
  "hostname": "www.example.com",
  "host": "www.example.com",
  "protocol": "https:",
  "href": "https://www.example.com/some/resource?foo=bar&q=baz"
}
~~~

So the `search` key contains the query string, however it’s not very usable as it is. We need to parse it. Assuming a non-empty query string you can do this:

~~~ .language-javascript
var parsedQuery = (function () {
  var query = window.location.search,
      parsed = {};
  // first get rid of the “?”
  query = query.substr(1);
  // get the different query string fields by splitting on “&”
  query = query.split('&');
  // iterate over each field’s key and value and assign value to parsed[key]
  for (var i = 0; i < query.length; i++) {
    // get key and value by splitting on “=”
    var field = query[i].split('='),
        key = window.decodeURIComponent(field[0]),
        value = window.decodeURIComponent(field[1]);
    parsed[key] = value;
  }
  // return parsed query
  return parsed;
}());
~~~

That’s all there is to it. Everything nicely inside an immediately-invoked function expression (IIFE) so we don’t pollute global scope with all those variables.

Keep in mind all values will be strings, so if your application expects otherwise you have to convert them yourself.

To conclude this short article I thought it would be nice to give you a minified version with an applicable isogram as function signature.

~~~ .language-javascript
var parsedQuery = (function(q,u,e,r,y){for(r=0;r<q.length;r++){y=q[r].split('=');u[e(y[0])]=e(y[1])}return u})(location.search.substr(1).split('&'),{},decodeURIComponent);
~~~
