/**
 * Module dependencies.
 */

var koa = require('koa');

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

module.exports = app;
