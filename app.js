/**
 * Module dependencies.
 */

var koa = require('koa'),
    static = require('koa-static');

/**
 * Koa app.
 */

var app = koa(),
    config = require('./config/config')[app.env],
    routes = require('./config/routes');

// koa setup
app.port = config.port;

// bootstrap routes
routes(app);

app.use(static('public'));

module.exports = app;
