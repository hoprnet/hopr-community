import React, { useState } from 'react';
import { Row, Col } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import HoprAddressTable from '../../components/tables/HoprAddress';
import InputFilter from '../../components/entry/InputFilter';
import SettingsModal from '../../components/layout/SettingsModal';
//Assets
import BrandLogo from '../../assets/brand/logo.svg';
//Hooks
import { useI18n } from '../../hooks/i18n.hook';

function generateData() {
  let data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      hopr_address: '10x' + parseInt(Math.random() * 1000000000000),
      hopr_staked_amount: parseInt(Math.random() * 100),
      hopr_total_amount: parseInt(Math.random() * 1000),
      hopr_total_channels: parseInt(Math.random() * 100),
    });
  }
  return data;
}
const HomeScreen = () => {
  const [, t] = useI18n();
  const [total] = useState(37648);
  const [data] = useState(generateData());
  return (
    <div className="home-screen fadeIn">
      <SettingsModal />
      <div className="wrapper">
        <Row justify="space-between" gutter={[40]} className="header">
          <Col xs={12} xl={12} className="image-left">
            <img src={BrandLogo} alt="HOPR" />
            <InputFilter />
          </Col>
          <Col xs={12} xl={7} className="align-right">
            <div className="token-total">
              <div className="title-head">
                <span>{t('HOPR_TOTAL_COUNT')}: </span>
                <span className="qty">{total} wxHOPR</span>
              </div>
            </div>
          </Col>
        </Row>
        <Row justify="space-between" className="sub-head">
          <Col>
            <h2>HOPR Channels</h2>
          </Col>
          <Col>
            <h2>Explore</h2>
          </Col>
        </Row>
        <div className="hopr-table">
          <HoprAddressTable dataSource={data} />
        </div>
        <div className="social-section">
          <div className="container">
            <div className="twitter-link">
              <FontAwesomeIcon icon={faTwitter} className="anticon" />

              <a
                href="https://twitter.com/hoprnet"
                target="_blank"
                rel="noreferrer"
              >
                @hoprnet.
              </a>
            </div>
            <div className="twitter-link">
              <FontAwesomeIcon icon={faTwitter} className="anticon" />

              <a
                href="https://twitter.com/hashtag/HOPRNetwork"
                target="_blank"
                rel="noreferrer"
              >
                #HOPRNetwork
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
