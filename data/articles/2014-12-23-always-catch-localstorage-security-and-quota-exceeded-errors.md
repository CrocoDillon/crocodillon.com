---
created: 2014-12-23 13:39:00
slug: always-catch-localstorage-security-and-quota-exceeded-errors
title: Always catch LocalStorage security and quota exceeded errors
description: Why you should always catch LocalStorage errors, and a cross-browser solution to catch the quota exceeded error.
excerpt: You might already be using LocalStorage, but do you play it safe and catch inevitable errors?
---

<p class="intro">LocalStorage is a browser feature that can improve website performance if used right and it’s even available in Internet Explorer 8! Data is stored client-side just like cookies, except with LocalStorage the data isn’t sent as header to the server on every request and the size limit is much higher. You can store about anything, for example cache inline above-the-fold CSS or web fonts.</p>

Sadly, detecting (and using) LocalStorage is not as easy as <code class="language-javascript">if (window.localStorage) { /* do stuff */ }</code> as LocalStorage will throw errors if things go wrong, which they will.

## Users can disable LocalStorage

If for instance the user has LocalStorage disabled, attempting to access the `window.localStorage` object is enough to throw a security error. Luckily, catching this error is quite easy.

~~~ .language-javascript
// Assuming you’re not in global scope…
var localStorage;
try {
  localStorage = window.localStorage;
} catch(e) {
  // Access denied :-(
}
~~~

This way you know that when the variable `localStorage` is set not only the browser supports it, but it’s also available for us to use. In any other case `localStorage` is undefined, so now you can safely do something like <code class="language-javascript">if (localStorage) { /* do stuff */ }</code> now.

I’ve seen articles suggesting checking <code class="language-javascript">typeof(window.localStorage) !== 'undefined'</code> to test for LocalStorage support. However you will get the same error. In order to check the type of something you need to access it first. What does work is <code class="language-javascript">'localStorage' in window</code>. This will return either true or false depending on LocalStorage being supported or not, even though it doesn’t give you any information about whether or not LocalStorage is disabled.

## LocalStorage can be full

If you try to set an item when the LocalStorage is full another type of error will be thrown. The maximum storage available is different per browser[^quota], but most browsers have implemented at least the w3c recommended maximum storage limit of 5MB[^disk-space]. This limit is per host so you will most likely not reach it very quickly. The catch (no pun intended) is that apparently in some browsers this limit can be customized by the user[^resig], so there is no guarantee you will never reach this limit. Better safe than sorry, so let’s deal with this error just in case. Ideally it would look like this:

~~~ .language-javascript
try {
  localStorage.setItem(key, value);
} catch(e) {
  if (e.code == 22) {
    // Storage full, maybe notify user or do some clean-up
  }
}
~~~

Unfortunately life is never that easy. Starting with Firefox (tested up to Firefox 35 which was the latest available beta at the time of writing), which has its own special implementation of the error object:

~~~ .language-javascript
{
  code: 1014,
  name: 'NS_ERROR_DOM_QUOTA_REACHED',
  message: 'Persistent storage maximum size reached',
  // …
}
~~~

Ironically enough, `DOMException.QUOTA_EXCEEDED_ERR` is 22 in Firefox just like in good browsers and there is no error with code 1014 listed in `DOMException`.

Then there is the good old Internet Explorer 8:

~~~ .language-javascript
{
  number: -2147024882,
  message: 'Not enough storage is available to complete this operation.',
  // …
}
~~~

This is solved in Internet Explorer 9, which — like a good browser — throws an error with code 22.

A cross-browser solution which checks if an error that occurs by trying to set an item is caused by a full storage takes all these inconsistencies into account.

~~~ .language-javascript
try {
  localStorage.setItem(key, value);
} catch(e) {
  if (isQuotaExceeded(e)) {
    // Storage full, maybe notify user or do some clean-up
  }
}

function isQuotaExceeded(e) {
  var quotaExceeded = false;
  if (e) {
    if (e.code) {
      switch (e.code) {
        case 22:
          quotaExceeded = true;
          break;
        case 1014:
          // Firefox
          if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            quotaExceeded = true;
          }
          break;
      }
    } else if (e.number === -2147024882) {
      // Internet Explorer 8
      quotaExceeded = true;
    }
  }
  return quotaExceeded;
}
~~~

## Performance of full storage

Another thing not related to errors but worth mentioning is that LocalStorage becomes slower as more data is stored[^performance]. For most browsers the time it takes for `localStorage.getItem` to return increases from a few milliseconds with a near empty storage to over a second with a full storage.

Use LocalStorage wisely, always catch errors and clean up after you no longer need something.

[^quota]:
    [Maximum storage available](http://www.html5rocks.com/en/tutorials/offline/quota-research/#toc-mobile) is different per browser.
[^disk-space]:
    W3C suggests a limit of [5MB disk space](http://dev.w3.org/html5/webstorage/#disk-space).
[^resig]:
    <q>However, the size of this storage area can be customized by the user (so a 5MB storage area is not guaranteed, nor is it implied) and the user agent (Opera, for example, may only provide 3MB – but only time will tell.)</q> ― [John Resig](http://ejohn.org/blog/dom-storage/)
[^performance]:
    [LocalStorage performance drops heavily](http://www.stevesouders.com/blog/2014/02/11/measuring-localstorage-performance/) when storage is near full.
