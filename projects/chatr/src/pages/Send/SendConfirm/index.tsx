import React from "react";
import styles from "./style.module.scss";

interface PageType {
  changePageHandle: (value: string | ((prevVar: string) => string)) => void;
  customName?: string;
}

const Send: React.FC<PageType> = (props: PageType) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.menu}>
          <div className={styles.left} id="leftArea">
            <img
              src="/images/backArrow.svg"
              alt="Icon"
              onClick={() => {
                props.changePageHandle("wallet");
              }}
            />
            <span>Send</span>
          </div>
          <div className={styles.right} />
        </div>
      </header>
      <div className={styles.content}>
        <div className={styles.status}>
          <img src="/images/success.svg" alt="Success" />
          <div className={styles.text}>Transaction sent successfully</div>
          <div
            className={styles.button}
            onClick={() => props.changePageHandle("wallet")}
          >
            OK
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <span>By</span>
        <img src="/images/metamath.svg" alt="MetaMath" />
        <div className={styles.resizer} />
      </div>
    </div>
  );
};

export default Send;
