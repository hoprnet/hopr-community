import React, { useState } from 'react';
import { Col, Row, Input, Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
//Hooks
import { useI18n } from '../../hooks/i18n.hook';
import { useNavigation } from '../../hooks/Nav.hook';

const InputFilter = () => {
  const [, t] = useI18n();
  const [value, setValue] = useState('');
  const [, nav] = useNavigation();
  return (
    <Row gutter={[10]} className="input-filter">
      <Col xs={12} xl={22}>
        <Input
          placeholder={t('HOPR_INPUT_TEXT')}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </Col>
      <Col xs={12} xl={2}>
        <Button
          type="primary"
          size="large"
          icon={<FontAwesomeIcon icon={faSearch} className="anticon" />}
          onClick={() => nav(`/node?address=${value}`)}
        >
          {t('HOPR_SEARCH')}
        </Button>
      </Col>
    </Row>
  );
};
export default InputFilter;
