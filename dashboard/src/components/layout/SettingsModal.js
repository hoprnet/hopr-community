import React, { useState } from 'react';
import { Modal } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import SettingsForm from '../entry/SettingsForm';
//Hooks
import { useI18n } from '../../hooks/i18n.hook';

const SettingsModal = () => {
  const [visible, setVisible] = useState(false);
  const [, t] = useI18n();
  return (
    <>
      <div className="settings-card">
        <FontAwesomeIcon
          icon={faCog}
          className="anticon"
          mask="square-full"
          color="white"
          onClick={() => setVisible(true)}
        />
      </div>
      <Modal
        title={<h4 style={{ textAlign: 'center' }}>{t('HOPR_SETTINGS')}</h4>}
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={() => setVisible(false)}
        closable={false}
        centered
        okText={t('HOPR_APPLY')}
        cancelText={t('HOPR_DISCARD')}
        okButtonProps={{ size: 'large' }}
        cancelButtonProps={{ size: 'large', type: 'default' }}
      >
        <SettingsForm />
      </Modal>
    </>
  );
};
export default SettingsModal;
