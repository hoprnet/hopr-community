import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
// ServiceWorker handler
import * as serviceWorker from '../serviceWorkerRegistration';
const ServiceWorkerWrapper = () => {
  const [newVersion, setNewVersion] = useState(null);
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const onSWUpdate = registration => {
    setShowReload(true);
    setWaitingWorker(registration.waiting);
  };

  useEffect(() => {
    //Register service worker with update hook
    serviceWorker.register({ onUpdate: onSWUpdate });
  }, []);

  const reloadPage = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setShowReload(false);
    if (newVersion !== null) {
      setNewVersion(null);
    }
    window.location.reload(true);
  };

  return (
    <Modal
      visible={showReload}
      title="Software Update"
      onCancel={() => setShowReload(false)}
      onOk={reloadPage}
      maskClosable={false}
      closable={false}
      centered
      okText="Update and reload"
    >
      <div style={{ textAlign: 'left' }}>
        <h1>A new version is available!</h1>
        <h3>The application will refresh after installation.</h3>
      </div>
    </Modal>
  );
};

export default ServiceWorkerWrapper;
