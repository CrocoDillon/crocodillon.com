var React = require('react'),
    App = require('../../public/js/build/server.js');

exports.index = function *(next) {
  App.run(this.path, function (html) {
    this.body = html;
  }.bind(this));
};
