import immutable from 'seamless-immutable';
import { createReducer, createActions } from 'reduxsauce';
import { i18nContent } from '../../i18n';

const { Types, Creators } = createActions({
  i18nLanguage: ['language'],
  i18nClear: [],
});
const INITIAL_STATE = immutable({
  language: 'en',
  content: i18nContent['en'],
  error: false,
  errorMessage: null,
});

function clear() {
  return INITIAL_STATE;
}
function setLanguage(state, action) {
  const { language } = action;
  switch (language) {
    case 'tc':
      return state.merge({
        language: 'tc',
        content: i18nContent['tc'],
      });
    default:
      return state.merge({
        language: 'en',
        content: i18nContent['en'],
      });
  }
}

const HANDLERS = {
  [Types.I18N_CLEAR]: clear,
  [Types.I18N_LANGUAGE]: setLanguage,
};

export const I18n = Creators;
export const i18nTypes = Types;
export default createReducer(INITIAL_STATE, HANDLERS);
