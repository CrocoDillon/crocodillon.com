---
created: 2014-07-30 21:02:00
slug: how-to-install-sassc-and-libsass-on-ubuntu
title: How to install SassC and LibSass on Ubuntu
description: Install guide of SassC and LibSass, from cloning their repositories to a working setup.
excerpt: And enjoy lightning fast Sass compilation! SassC is written in C/C++ and is at least 10 times faster than the original Sass written in Ruby.
---

<p class="intro">LibSass is a C/C++ port of the Sass engine, which was originally written in Ruby, and therefore much faster. To use LibSass you also need an implementer, in this case SassC which is written in C. There are other implementers, for example <code>node-sass</code> which is used by <code>grunt-sass</code> and <code>gulp-sass</code>.</p>

## Why not just use Grunt or Gulp?

First let me explain why you should bother with installing SassC and not just use the Grunt or Gulp module instead. Sure they are both really easy to install, for example `npm install --save-dev gulp-sass`. One reason to use SassC instead is to avoid the overhead of Grunt or Gulp. Another reason is that SassC[^sassc] is always kept in sync with LibSass[^libsass], so you don’t risk out-of-date dependencies. SassC might not be the easiest implementer to install, but it’s not that hard either and worth the effort. So let’s start!

## Prerequisites

I’ll be covering how to install SassC on Ubuntu. However it is probably possible to follow parts of this guide if you are on a different Linux distribution. Some commands might need root privileges, so run those with `sudo`.

You need to have the git package installed to clone the SassC and LibSass repositories, and the build-essential package which contains the tools necessary to run `make` and compile SassC.

<p class="note--warning">You might already have one or both installed, so make sure to check first.</p>

~~~ .language-bash
sudo apt-get install git
sudo apt-get install build-essential
~~~

## Download and install SassC and LibSass

Now you need to download SassC and LibSass by cloning their repositories. But in what directory? I can suggest a few but if you have a better suggestion please leave a comment. If you only want to install it for a specific user a good place would be that user’s home directory, for example `~/lib/`. To install it for all users `/usr/local/lib/` will do. All my global node modules are installed in `/usr/local/lib/` so that’s where I installed SassC and LibSass as well. Just change that part to the directory of your choice.

~~~ .language-bash
cd /usr/local/lib/
git clone git@github.com:sass/sassc.git
git clone git@github.com:sass/libsass.git
# Initialize and update the submodule sass2scss…
cd libsass/
git submodule update –-init
~~~

To make SassC you need to let it know where to find LibSass, by using the `SASS_LIBSASS_PATH` variable. I’m putting this variable in `/etc/environment` so it’s available to all users. If you are installing SassC for a specific user only, it makes more sense to put it in `~/.profile`.

~~~ .language-bash
echo 'SASS_LIBSASS_PATH="/usr/local/lib/libsass"' >> /etc/environment
# Flush the changes…
source /etc/environment
# Make sure it worked…
echo $SASS_LIBSASS_PATH
# Now you can make SassC…
cd /usr/local/lib/sassc/
make
~~~

The final step is to make sure the `sassc` command is in your `PATH` by creating a symbolic link in `/usr/local/bin/`.

~~~ .language-bash
cd /usr/local/bin/
ln -s ../lib/sassc/bin/sassc sassc
~~~

Congratulations! SassC is now installed and should be available using the `sassc` command, see `sassc -h` for usage instructions.

[^libsass]:
    [LibSass](https://github.com/sass/libsass) is a C/C++ port of the Sass engine.
[^sassc]:
    [SassC](https://github.com/sass/sassc) is the official binary wrapper for LibSass.
