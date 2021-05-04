import { useSelector, useDispatch } from 'react-redux';
import { I18n } from '../redux/reducers/i18n';

export const useI18n = () => {
  const dispatch = useDispatch();
  const { content, language } = useSelector(state => state.i18n);
  const setter = lan => {
    dispatch(I18n.i18nLanguage(lan));
  };
  const getLabelI18n = label => {
    if (!content[label]) {
      return label;
    }
    return content[label];
  };
  return [language, getLabelI18n, setter];
};
