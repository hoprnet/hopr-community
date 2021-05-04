import React, { useState } from 'react';
import { Row, Col } from 'antd';
import HoprNodeTable from '../../components/tables/HoprNode';
import SettingsModal from '../../components/layout/SettingsModal';
//Assets
import BrandLogo from '../../assets/brand/logo.svg';
//Hooks
import { useI18n } from '../../hooks/i18n.hook';
import { useNavigation } from '../../hooks/Nav.hook';

function generateData() {
  let data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      hopr_address: '10x' + parseInt(Math.random() * 1000000000000),
      hopr_staked_amount: parseInt(Math.random() * 100),
      hopr_total_amount: parseInt(Math.random() * 1000),
    });
  }
  return data;
}
const NodeScreen = () => {
  const [, t] = useI18n();
  const [total] = useState(348);
  const [data] = useState(generateData());
  const [, nav] = useNavigation();
  return (
    <div className="node-screen fadeIn">
      <SettingsModal />
      <div className="wrapper">
        <Row justify="space-between" gutter={[40]}>
          <Col xs={12} xl={12}>
            <img
              src={BrandLogo}
              alt="HOPR"
              style={{ cursor: 'pointer' }}
              onClick={() => nav('/')}
            />
          </Col>
          <Col xs={12} xl={7} className="align-center">
            <div className="token-total">
              <div className="title-head">
                {t('HOPR_STAKED')}:<span className="primary-mk">{total}</span>
              </div>
              <div className="title-head">
                {t('HOPR_NODE_UPTIME')}:
                <span className="primary-mk">12H 30min</span>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="input-filter ">
          <Col>
            {t('HOPR_OPENED_CHANNELS')}:
            <span className="primary-mk">{data.length} </span>
          </Col>
        </Row>
        <div className="hopr-table">
          <HoprNodeTable dataSource={data} />
        </div>
      </div>
    </div>
  );
};

export default NodeScreen;
