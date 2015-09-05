exports.index = function *(next) {
  this.body = 'BlogController => IndexAction';
};

exports.article = function *(next) {
  this.body = 'BlogController => ArticleAction: "' + this.params.slug + '"';
};
