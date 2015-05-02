---
created: 2013-12-31 14:56:00
slug: mongodb-for-dbas-crud
title: MongoDB for DBAs: CRUD
description: Summary of the “MongoDB for DBAs” course at MongoDB University. Week 2 is about basic CRUD operations and administrative commands.
excerpt: Week 2: CRUD operations and administrative commands.
---

Week 2 of “MongoDB for DBAs” is about CRUD, mainly write operations like inserts and updates, but also a little bit about administrative commands in the shell.

<p class="note--info">You can watch the lectures of week 2 on <a href="https://www.youtube.com/playlist?list=PLOqwUgCzNJcuQDNQgDe8BV5Iztsl7v_CX" target="_blank">YouTube</a>.</p>

## Overview last week

Last week I [wrote](/blog/mongodb-for-dbas-introduction) a little bit about the concepts and philosophy of MongoDB, why you’d want to use MongoDB, what are the differences between MongoDB and relational databases. I suggest you read that article first if you haven’t yet because most articles about MongoDB don’t cover background theory like that.

Anyway, to follow along with this article at least have MongoDB available and some data to play with, for example import the `products.json` file:

*   Download a package from [mongodb.org](http://www.mongodb.org/downloads) and unpack it.
*   Create a directory for MongoDB data, for examle `/data/db` (default).
*   In the shell, go to the directory where you unpacked MongoDB and run:

        ./mongod --dbpath /data/db

*   Download [products.json](/demo/mongodb-for-dbas/products.json) and then import (in another shell) that file in collection “products” from database “pcat” (both database and collection will be created automatically):

        ./mongoimport -d pcat -c products < /path/to/products.json

*   Run the Mongo shell:

        ./mongo localhost/pcat

Now you’re ready to go!

## Create or insert data

Let’s start with “create” or, in MongoDB, insert data. Take a look at the following figure, inserting data means inserting documents into collections.

<figure>
  <img src="/images/blog/2013/mongodb-for-dbas__structure.png" alt="Mongo clusters contain databases, databases contain collections and collections contain documents.">
</figure>

In the shell the basic syntax for inserting is:

~~~ .language-javascript
> db.<collection>.insert(<document>)
~~~

After which you can call:

~~~ .language-javascript
> db.getLastError()
~~~

Which returns a string if there was an error, or `null` if there wasn’t. Actually in the shell this gets called automatically when you return to the prompt, but in scripts you might want to use `getLastError` to see if an insert was successful or not. If you leave out the parentheses you can see what the method does:

~~~ .language-javascript
> db.getLastError
function ( w , wtimeout ){
    var res = this.getLastErrorObj( w , wtimeout );
    if ( ! res.ok )
        throw "getlasterror failed: " + tojson( res );
    return res.err;
~~~

We can see `getLastErrorObj` gets called:

~~~ .language-javascript
> db.getLastErrorObj()
{ "n" : 0, "connectionId" : 1, "err" : null, "ok" : 1 }
~~~

Which returns an object. We can use the same trick to see this method’s native code:

~~~ .language-javascript
> db.getLastErrorObj
function ( w , wtimeout ){
    var cmd = { getlasterror : 1 };
    if ( w ){
        cmd.w = w;
        if ( wtimeout )
            cmd.wtimeout = wtimeout;
    }
    var res = this.runCommand( cmd );

    if ( ! res.ok )
        throw "getlasterror failed: " + tojson( res );
    return res;
~~~

Which tells us this is actually a helper method for running the command:

~~~ .language-javascript
> db.runCommand( {"getLastError": 1} )
{ "n" : 0, "connectionId" : 1, "err" : null, "ok" : 1 }
~~~

<p class="note--warning">All commands return the field <code class="language-javascript">"ok": 1</code> meaning the command was successful, or <code class="language-javascript">"ok": 0</code> if the command failed. This does <strong>not</strong> mean there was no error.</p>

To illustrate run:

~~~ .language-javascript
> db.products.insert( {"_id": "ac3"} )
> db.runCommand( {"getLastError": 1} )
~~~

Which will give us the error because `ac3` is a duplicate key, yet the `getLastError` command was successful so `"ok": 1`. Note that `getLastError` was called automatically even before we ran the command.

But I digress, you might wonder if we’re still talking about inserts. Back to subject, while a lot drivers do have bulk inserts, the Mongo shell doesn’t. That’s okay though, because inserting files one by one is reasonably fast as the client wouldn’t have to wait for a response from the server after each insert. However, try this:

~~~ .language-javascript
> db.products.find( {}, {"_id": 1} )
> for (var i = 0; i < 5; i++) db.products.insert( {"_id": "ac" + i} )
> db.products.find( {}, {"_id": 1} )
~~~

We didn’t get an error back, even though there was an error with one of those inserts. “But I thought that `getLastError` was called automatically”, well like I said, only when you return to the prompt. The reason for this is if `getLastError` was called after each insert, the client _would_ have to wait for a response from the server after each insert, which would be much slower. It still makes sense to call `getLastError` after each insert manually though.

## Update one or more documents in a collection

The basic syntax for updating is:

~~~ .language-javascript
> db.<collection>.update(<where>
                       , <document>
                      [, <upsert>
                      [, <multi> ]])
~~~

*   `where`, which documents you want to update.
*   `document`, full document or partial update _expression_ (explained in a bit).
*   `upsert`, optional boolean meaning “update, or insert if not present”, default `false`.
*   `multi`, optional boolean to update more then one document, default `false`.

By default `update` only updates the first document that matches the `where` expression. This is to prevent MongoDB having to look at the entire collection if the `where` expression doesn’t use indexed keys. However with partial updates you probably want all matches updated. Let’s take a look at some examples.

### Full update

~~~ .language-javascript
> db.products.find( {"_id": "ac3"} ).pretty()
> var doc = db.products.findOne( {"_id": "ac3"} )
> doc.available = false
> db.products.update( {"_id": doc._id}, doc )
> db.products.find( {"_id": "ac3"} ).pretty()
~~~

Actually there is a helper method for full updates:

~~~ .language-javascript
> doc.available = true
> db.products.save( doc )
> db.products.find( {"_id": "ac3"} ).pretty()
~~~

Again, you can see how the `save` method works by typing it without parentheses to get the native code. Try that yourself.

### Partial update

When you make few changes, partial updates are more efficient because you don’t need to send the whole document to the server. Instead of a document as second parameter you use an update expressions containing special update operators.[^update-operators]

~~~ .language-javascript
> db.products.update( {"_id": "ac3"}, {"$set": {"price": 300}} )
> db.products.find( {"_id": "ac3"} ).pretty()
~~~

Likewise there are operators to work with arrays like `$addToSet`, which adds an element to an array if not already present. MongoDB is smart enough that if you update a non-existing field, it will create that field for you. Try it.

~~~ .language-javascript
> db.products.update( {"_id": "ac3"}, {"$addToSet": {"colors": "blue"}} )
> db.products.find( {"_id": "ac3"} ).pretty()
~~~

In these cases you know you’ll only update one document, because `_id` is the primary key. However, when you expect to update multiple documents, you have to explicitly say so. For example:

~~~ .language-javascript
> db.products.update( {"type": "case"}, {$set: {"warranty_years": 0.5}}, false, true)
~~~

Upserts, or “update, or insert if not present”, can be used to “update” documents that may not exist yet. For example:

~~~ .language-javascript
> db.products.find( {"_id": "ac10"} ) // nothing...
> db.products.update( {"_id": "ac10"}, {"$inc": {"views": 1}}, true )
> db.products.find( {"_id": "ac10"} ) // ...new document!
~~~

## Delete or remove documents

The basic syntax for removing is:

~~~ .language-javascript
> db.<collection>.remove(<where>)
~~~

This removes _all_ documents that match the `where` expression so you might want to check which documents you’re removing by using `find(<where>)` first.

~~~ .language-javascript
> db.<collection>.remove()
~~~

This removes _all_ documents from the collection, but does not remove the collection itself. To remove the collection use:

~~~ .language-javascript
> db.<collection>.drop()
~~~

## Order of documents

It’s important to keep in mind that documents in MongoDB don’t have any particular order. The reason for this is the way documents are stored in data files. If you would store documents in order, and one of the documents increases in size, all following documents would have to be shifted to make more room for that document. That wouldn’t be very efficient, that’s why MongoDB stores documents in records, which are part of extends. Extends only contain documents from a single collection, to keep some degree of continuousness so collection scans are fast.

<figure>
  <img src="/images/blog/2013/mongodb-for-dbas__data-files.png" alt="Data files containing extends in which documents are stored in records.">
  <figcaption>Structure of data files where documents are stored in records.</figcaption>
</figure>

Records are a little bit larger than the document itself to allow for some growth, this extra space is called “padding”. But if the documents grows too much, it’s moved to a bigger record, which as a side-effect may change the document order.

By the way, there is a maximum document size in MongoDB, which is 16MB. This is some kind of sanity check, not a technical limitation. You can store larger things in MongoDB using “GridFS”.[^gridfs]

## Administrative commands

Let’s talk about commands in the “Mongo wire protocol”, or “BSON wire protocol”. If you’d write a database driver you’d want to know all the details about that protocol, otherwise probably not.

Commands are send to the server as queries, where the query expression is the command. The server will run the command against a special collection called `$cmd` and send back a single document as response. There are lots of commands, like 100 or so… but only about 20 are used often and something like 5 are used real often.[^commands] Some examples:

*   __Server commands__
    *   `getLastError`
    *   `isMaster`
    *   `serverStatus`
    *   `logout`
*   __Database commands__
    *   `repairDatabase`
    *   `dropDatabase`
    *   `dbStats`
    *   `clone`
    *   `copydb`
*   __Collection commands__
    *   `create`
    *   `drop`
    *   `compact`
    *   `collStats`
    *   `renameCollection`
    *   `count`
    *   `aggregate`
    *   `mapReduce`
    *   `findAndModify`
*   __Index commands__
    *   `ensureIndex`
    *   `dropIndex`

Some of which are user commands and some are DBA commands. Depending on the specific command, DBA commands sometimes run against a special “admin” database, for security reasons.

The typical syntax to invoke a command in the shell is:

~~~ .language-javascript
db.runCommand( {<command>: <value>} )
~~~

But the query can contain extra fields, for example if you have a replica set (replica sets will be explained in a future article). Let’s say you have a replica set with some servers and you want to get the last error. Normally the command returns after the primary server. To wait for more servers before returning you can set the `w` field:

~~~ .language-javascript
db.runCommand( {
  "getLastError": 1,
  "w": 3,          // optional, wait for 3 servers
  "wtimeout": 1000 // optional, timeout in ms
} )
~~~

In the shell, you can find a lot commands and helper methods that run commands using the help methods:

~~~ .language-javascript
> help
> db.help()
~~~

Helper methods are methods that run a command, but with less typing. For example the following are all equivalent:

~~~ .language-javascript
> db.runCommand( {"isMaster": 1} )
> db.runCommand( "isMaster" ) // shortcut
> db.isMaster()               // helper
~~~

The native code of these methods is interesting:

~~~ .language-javascript
> db.isMaster
function () { return this.runCommand("isMaster"); }
> db.runCommand
function ( obj ){
    if ( typeof( obj ) == "string" ){
        var n = {};
        n[obj] = 1;
        obj = n;
    }
    return this.getCollection( "$cmd" ).findOne( obj );
}
~~~

This is interesting because you can see commands are run as query (overloading normal query behaviour) against the special collection `$cmd`.

Some other useful commands are `currentOp`, which returns an array with currently running operations with information like and operation id and how long the operation is running. If you find operations that are problematic you can kill those with the command `killOp` which takes the operation id as parameter.

As mentioned some commands only run against the `admin` database, one of those is the `listDatabases` command which more or less returns the same information as `show dbs`. There are two ways of running commands against the `admin` database, either switch to `admin`:

~~~ .language-javascript
> db.runCommand( "listDatabases" ) // this gives an error
{ "ok" : 0, "errmsg" : "access denied; use admin db" }
> use admin
> db.runCommand( "listDatabases" )
~~~

Or use the `adminCommand` helper:

~~~ .language-javascript
> db.adminCommand( "listDatabases" )
~~~

## Collection indexes

Back to our `products` collection, try:

~~~ .language-javascript
> db.products.find( {"name": "AC3 Case Red"} ).explain()
~~~

You’ll notice the server had to scan all documents to find this product, because there is no index on the `name` field. Let’s add that index and try again:

~~~ .language-javascript
> db.products.ensureIndex( {"name": 1} )
> db.products.find( {"name": "AC3 Case Red"} ).explain()
~~~

Now the server only had to scan one document, the one that matches our query. MongoDB uses a B-tree implementation for its indexes, as you can tell from the `cursor` field from the `explain` method.[^b-tree] Finally, to drop an index use:

~~~ .language-javascript
> db.products.dropIndex( {"name": 1} )
~~~

Next week will be about advanced queries, until then!

[^update-operators]:
    List of all update operators is available on [docs.mongodb.org](http://docs.mongodb.org/manual/reference/operator/update/).
[^gridfs]:
    [GridFS](http://docs.mongodb.org/manual/core/gridfs/) is a specification for storing and retrieving files that exceed the BSON-document size limit of 16MB.
[^commands]:
    See the list of all database commands on [docs.mongodb.org](http://docs.mongodb.org/manual/reference/command/).
[^b-tree]:
    Details about the B-tree structure on [Wikipedia](http://en.wikipedia.org/wiki/B-tree).

*[CRUD]: Create Read Update Delete
