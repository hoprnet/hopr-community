import immutable from 'seamless-immutable';
import { createReducer, createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  authRequest: [],
  authSuccess: ['token', 'user', 'role'],
  authFailure: ['error'],
  authSetUser: ['user'],
  authClear: [],
  authPre: ['token'],
  authSendSuccess: [],
});
const INITIAL_STATE = immutable({
  token: '',
  preToken: '',
  user: {},
  role: {},
  error: false,
  errorMessage: null,
  loading: false,
});

function success(state, action) {
  let { user, role, token } = action;
  return state.merge({
    loading: false,
    error: false,
    errorMessage: null,
    user,
    role,
    token,
  });
}
function request(state) {
  return state.merge({ loading: true, error: false, errorMessage: null });
}
function failure(state, action) {
  let { error } = action;
  return state.merge({
    loading: false,
    error: true,
    errorMessage: error,
  });
}
function pre(state, action) {
  const { token } = action;
  return state.merge({
    loading: false,
    error: false,
    errorMessage: null,
    preToken: token,
  });
}
function codeSuccess(state) {
  return state.merge({
    loading: false,
    error: null,
    errorMessage: null,
  });
}
const setUser = function (state, action) {
  let { user } = action;
  return state.updateIn(['user'], obj => obj.merge(user));
};
function clear() {
  return INITIAL_STATE;
}

const HANDLERS = {
  [Types.AUTH_REQUEST]: request,
  [Types.AUTH_SUCCESS]: success,
  [Types.AUTH_FAILURE]: failure,
  [Types.AUTH_SET_USER]: setUser,
  [Types.AUTH_CLEAR]: clear,
  [Types.AUTH_PRE]: pre,
  [Types.AUTH_SEND_SUCCESS]: codeSuccess,
};

export const Auth = Creators;
export const authTypes = Types;
export default createReducer(INITIAL_STATE, HANDLERS);
