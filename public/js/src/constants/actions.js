const actions = {};

[
  'ROUTER_STATE_CHANGE',

  'FETCH_POSTS',
  'FETCH_POSTS_SUCCESS',
  'FETCH_POSTS_FAILURE',

  'FETCH_POST',
  'FETCH_POST_SUCCESS',
  'FETCH_POST_FAILURE'
].forEach(action => {
  actions[action] = action;
});

export default actions;
