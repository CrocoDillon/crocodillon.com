const actions = {};

[
  'ROUTER_STATE_CHANGE'
].forEach(action => {
  actions[action] = action;
});

export default actions;
