/**
 * Module dependencies.
 */

var router = require('koa-router')();

/**
 * Controllers.
 */

var index = require('../app/controllers/index'),
    blog  = require('../app/controllers/blog');

/**
 * Routes.
 */

router.get('/', index.index);
router.get('/blog', blog.index);
router.get('/blog/:slug', blog.article);

module.exports = function(app) {
  app.use(router.routes());
  app.use(router.allowedMethods());
};
