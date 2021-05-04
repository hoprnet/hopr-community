import { store } from '../redux/store';

import en from './languages/en.json';

export const i18nContent = { en };

export const getLabelI18n = label => {
  const language = store.getState().i18n.language;
  if (!i18nContent[language] || !i18nContent[language][label]) {
    return 0;
  }
  return i18nContent[language][label];
};
