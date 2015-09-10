var App = require('../../public/js/build/bundle.js');

exports.index = function *(next) {
  App.run(this.path, function (body) {
    this.body = body;
  }.bind(this));
};
