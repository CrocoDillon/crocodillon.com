function mirror(keys) {
  var m = {};
  keys.forEach(k => {
    m[k] = k;
  });
  return m;
}

export default mirror([
  'FETCH_POSTS',
  'FETCH_POSTS_SUCCESS',
  'FETCH_POSTS_FAILURE',

  'FETCH_POST',
  'FETCH_POST_SUCCESS',
  'FETCH_POST_FAILURE'
]);
