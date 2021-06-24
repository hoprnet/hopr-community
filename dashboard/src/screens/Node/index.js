import React, { useState } from 'react';
import { Row, Col } from 'antd';
import HoprNodeTable from '../../components/tables/HoprNode';
import SettingsModal from '../../components/layout/SettingsModal';
import InputFilter from '../../components/entry/InputFilter';
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
        <Row justify="space-between" gutter={[40]} className="header">
          <Col xs={12} xl={12} className="image-left">
            <img src={BrandLogo} alt="HOPR" onClick={() => nav('/')} />
            <InputFilter />
          </Col>
          <Col xs={12} xl={7} className="align-right">
            <div className="token-total">
              <div className="title-head">
                <span>{t('HOPR_TOTAL_COUNT')}: </span>
                <span className="qty">{total} wxHOPR</span>
              </div>
              <div className="title-head">
                <span>Stacked per node (myself):</span>
                <span className="qty">{total / 2} wxHOPR</span>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="sub-head ">
          <Col>
            Your HORP address:
            <span>{data.length} </span>
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
