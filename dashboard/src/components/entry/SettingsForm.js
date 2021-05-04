import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';
//Hooks
import { useI18n } from '../../hooks/i18n.hook';

const SettingsForm = ({ formRef, onSubmit, disable = false }) => {
  const [, l] = useI18n();

  return (
    <Form
      name="settings"
      form={formRef}
      onFinish={onSubmit}
      layout="vertical"
      labelAlign="left"
      className="settings-form"
    >
      <Form.Item label={l('HOPR_CHANEL_ADDRESS')} name="channels_address">
        <Input className="input-min" disabled={disable} />
      </Form.Item>
      <Form.Item label={l('HOPR_RPC')} name="prc_endpoint">
        <Input className="input-min" />
      </Form.Item>
    </Form>
  );
};
SettingsForm.propTypes = {
  onSubmit: PropTypes.func,
  formRef: PropTypes.any,
  disable: PropTypes.bool,
};
export default SettingsForm;
