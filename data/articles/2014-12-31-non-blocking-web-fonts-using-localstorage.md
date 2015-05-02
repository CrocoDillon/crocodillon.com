---
created: 2014-12-31 14:38:00
slug: non-blocking-web-fonts-using-localstorage
title: Non-blocking web fonts using LocalStorage
description: You want custom web fonts, but without the performance drawback? Read how to use a simple script to load base64 encoded web fonts in a non-blocking way and cache them in LocalStorage.
excerpt: Web fonts, without the performance drawback. By using a simple script to load base64 encoded web fonts in a non-blocking way and cache them in LocalStorage.
---

<p class="intro">I work at a game publishing company called SpilGames and in the past 6 months or so we redesigned some of our game portals, a part of that redesign was a custom web font. At the same time we were constantly trying to improving page load times and we had to remove the web font because this was a blocking request.</p>

I was dedicated to bring that font back, with the following requirements:

- No blocking request, e.g. to Google Fonts
- No loading of font resources before the page is rendered
- Normalizing browser inconsistencies[^browser-fout] to what is considered best approach
- Use caching so resources only need to be downloaded on first page load

## Something I learned from The Guardian

Obviously we are not the only one trying to improve web font performance. During an in-house workshop Vitaly Friedman showed how The Guardian uses JavaScript to load and store their web fonts. Using JavaScript you have more control over when to retrieve the web fonts and how to cache them, independent of what browser your user is using. Their logic is divided in pre-render and post-render.

<figure>
  <img src="/images/blog/2014/non-blocking-web-fonts-using-localstorage__the-guardian.png" alt="The Guardian divides their web font loading logic in pre-render and post-render.">
</figure>

“Cut the mustard” is a simple test to detect whether or not the browser is reasonably modern and looks something like:

~~~ .language-javascript
var isModernBrowser = (
  'querySelector' in document &&
  'localStorage' in window &&
  'addEventListener' in window
);
~~~

I did not find a solution how to test WOFF support[^woff] but I did find a way to test for WOFF2 support, I will get to that later. For now, Internet Explorer 8 doesn’t support WOFF, however it’s already excluded by the “cut the mustard” test. The other browsers that don’t support WOFF will still download (and cache) the file but only once, which is not that bad. I guess you can do some simple User Agent sniffing to detect Opera Mini and older Android browsers but I won’t go there… not for now at least.

## Converting fonts to JSON using base64 encoding

To store a web font in LocalStorage we need to convert the font to a string using base64 encoding. I made a tool to do all that work for you, it’s called [font-store](https://github.com/CrocoDillon/font-store) and available on [npm](https://www.npmjs.com/package/font-store). It’s very basic for now but gets the job done. All you need is to supply a link to a CSS file with font resources in WOFF format (any Google Fonts link will do) and the tool will fetch those resources, base64 encode them and create a JSON file with two keys. The `value` key contains the CSS file contents with the font resources base64 encoded. For cache busting you also need a fingerprint, that’s why the `md5` key contains the md5 hash of the value.

## Caching and retrieving fonts from LocalStorage

On first page load we want to fetch the web fonts and store them in LocalStorage. We do that after the page has rendered using the load event. The script has to be in the head element because on subsequent page loads we want to apply the web fonts before anything is rendered.

When working with LocalStorage make sure to [catch inevitable errors](http://crocodillon.com/blog/always-catch-localstorage-security-and-quota-exceeded-errors).

~~~ .language-javascript
var md5 = 'e90ba95faca6e63b5516ed839f4514ec',
    key = 'fonts',
    cache;

function insertFont(value) {
  var style = document.createElement('style');
  style.innerHTML = value;
  document.head.appendChild(style);
}

// PRE-RENDER
try {
  cache = window.localStorage.getItem(key);
  if (cache) {
    cache = JSON.parse(cache);
    if (cache.md5 == md5) {
      insertFont(cache.value);
    } else {
      // Busting cache when md5 doesn't match
      window.localStorage.removeItem(key);
      cache = null;
    }
  }
} catch(e) {
  // Most likely LocalStorage disabled
  return
}

// POST-RENDER
if (!cache) {
  // Fonts not in LocalStorage or md5 did not match
  window.addEventListener('load', function() {
    var request = new XMLHttpRequest(),
        response;
    request.open('GET', '/path/to/fonts.json', true);
    request.onload = function() {
      if (this.status == 200) {
        try {
          response = JSON.parse(this.response);
          insertFont(response.value);
          window.localStorage.setItem(key, this.response);
        } catch(e) {
          // LocalStorage is probably full
        }
      }
    };
    request.send();
  });
}
~~~

<p class="note--info">A working demo can be found on <a href="http://codepen.io/CrocoDillon/pen/dkcbs/left/?editors=001" target="_blank">CodePen</a>.</p>

## Better compression with WOFF2

With a little bit extra effort you can take this even further, with WOFF2. WOFF2 offers better compression resulting in a 25 to 50% (30% on average) decreased file size over WOFF. Even though WOFF2 is not supported by that many browsers yet[^woff2], it might be worth it to use feature detection[^woff2-detection] and serve WOFF2 to capable browsers.

~~~ .language-javascript
var format = (function() {
  if (window.FontFace) {
    var fontFace = new FontFace('t', 'url(data:application/font-woff2,) format(woff2)', {});
    fontFace.load();

    if (fontFace.status == 'loading') {
      return 'woff2';
    }
  }

  return 'woff';
})();
~~~

<p class="note--warning">The third argument for the FontFace constructor is supposed to be optional but some browsers (Chrome 35 and 36, Opera 22 and 23) throw an error if omitted.</p>

At the time of writing font-store doesn’t output WOFF2 yet, but that will change.

## What about Internet Explorer 8?

I tried adding an EOT font but even with the base64 encoding under the Internet Explorer 8 limit of 32kB[^ie8-limit], I couldn’t get it to work. If you can get it to work please let me know, that would be greatly appreciated.

[^browser-fout]:
    Seems like “Use a system font immediately while the webfont loads. When it does, change the font” is the most popular way [browsers could handle <abbr title="Flash of Unstyled Text">FOUT</abbr> with web fonts](https://plus.google.com/+PaulIrish/posts/MeoUmZxNRZB).
[^woff]:
    <abbr title="Web Open Font Format">WOFF</abbr> is pretty much [supported by all modern browsers](http://caniuse.com/#feat=woff).
[^woff2]:
    WOFF2 is currently only [supported by Chrome and Opera](http://caniuse.com/#feat=woff2) but that’s still almost 40% of all browser usage.
[^woff2-detection]:
    A simple [feature test for the WOFF2 font format](https://github.com/filamentgroup/woff2-feature-test).
[^ie8-limit]:
    [Data URI](http://caniuse.com/#feat=datauri) length in Internet Explorer 8 is [limited to 32kB](http://msdn.microsoft.com/en-us/library/cc848897%28VS.85%29.aspx).
