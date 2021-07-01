import React, { useState } from 'react';
import { Input } from 'antd';
//Hooks
import { useI18n } from '../../hooks/i18n.hook';
import { useNavigation } from '../../hooks/Nav.hook';

const InputFilter = () => {
  const [, t] = useI18n();
  const [value, setValue] = useState('');
  const [, nav] = useNavigation();
  return (
    <div className="input-filter">
      <Input
        placeholder={t('HOPR_INPUT_TEXT')}
        value={value}
        onChange={e => setValue(e.target.value)}
        onSearch={e => nav(`/node?address=${e}`)}
      />
    </div>
  );
};
export default InputFilter;
