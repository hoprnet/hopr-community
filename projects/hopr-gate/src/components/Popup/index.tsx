import React, { useContext, useState } from "react";
import { AppContext } from "../../contexts/AppContext";
import { getUserConfig } from "../../lib/url";
import styles from "./styles.module.scss";

const Popup: React.FC = () => {
  const { setPopup } = useContext(AppContext);
  const userConfig = getUserConfig();
  const [ url, setUrl ] = useState(userConfig.apiEndpoint);
  const [ token, setToken ] = useState(userConfig.apiToken);

  const handleSave = () => {
    const userData = {
      apiEndpoint: url,
      apiToken: token,
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    setPopup(false);
    window.location.reload();
  }

  return (
    <div className={styles.popup}>
      <div className={styles.background} onClick={() => setPopup(false)} />
      <div className={styles.settings}>
        <img
          src="/images/close.svg"
          alt="Close"
          onClick={() => setPopup(false)}
        />
        <div className={styles.title}>HOPR Node Settings</div>
        <div className={styles.form}>
          <div className={styles.item}>
            <div className={styles.title}>
              <label htmlFor="API_URL">API URL:</label>
            </div>
            <input type="text" name="API_URL" id="SETTINGS_API_URL" value={url} onChange={(e) => setUrl(e.target.value)}/>
          </div>

          <div className={styles.item}>
            <div className={styles.title}>
              <label htmlFor="API_URL">API Token:</label>
            </div>
            <input type="text" name="API_URL" id="SETTINGS_API_URL" value={token} onChange={(e) => setToken(e.target.value)}/>
          </div>

          <div className={styles.saveButton} onClick={handleSave}>Save</div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
