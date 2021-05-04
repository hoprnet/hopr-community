import immutable from 'seamless-immutable';
import { createReducer, createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  appDrawer: ['drawer'],
  appTab: ['tab'],
  appClear: [],
  appConfig: ['config'],
  appVersion: ['version'],
});
const INITIAL_STATE = immutable({
  drawer: false,
  tab: 'home',
  error: false,
  errorMessage: null,
  version: '1.0',
  config: {},
});

function drawer(state, action) {
  return state.merge({
    drawer: action.drawer,
  });
}
function tabHandler(state, action) {
  const { tab } = action;
  return state.merge({
    tab,
  });
}
function clear(state) {
  const { version } = state;
  return INITIAL_STATE.merge({ version });
}
function configHandler(state, action) {
  const { config } = action;
  return state.merge({ config });
}
function appVersion(state, action) {
  const { version } = action;
  return state.merge({ version });
}
const HANDLERS = {
  [Types.APP_CLEAR]: clear,
  [Types.APP_DRAWER]: drawer,
  [Types.APP_TAB]: tabHandler,
  [Types.APP_CONFIG]: configHandler,
  [Types.APP_VERSION]: appVersion,
};

export const App = Creators;
export const appTypes = Types;
export default createReducer(INITIAL_STATE, HANDLERS);
