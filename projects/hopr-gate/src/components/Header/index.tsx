import React, { useContext, useEffect } from "react";
import { AppContext } from "../../contexts/AppContext";
import { WebsocketContext } from "../../contexts/WebsocketProvider";
import styles from "./styles.module.scss";

const Header: React.FC = () => {
  const { setPopup } = useContext(AppContext);
  const { myPeerId } = useContext(WebsocketContext);
  const id = myPeerId ? `${myPeerId?.slice(0, 12)}...` : "Not Connected";

  return (
    <nav className={styles.header}>
      <div className={styles.sides}>
        <div className={styles.left}>
          <img src="/images/logo.svg" alt="Logo" />
        </div>
        <div className={styles.right}>
          <span>{id}</span>
          <img
            src="/images/gear.svg"
            alt="Logo"
            onClick={() => setPopup(true)}
          />
        </div>
      </div>
    </nav>
  );
};

export default Header;
