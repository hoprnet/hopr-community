import React from "react";
import styles from "./style.module.scss";

interface PageType {
  changePageHandle: (value: string | ((prevVar: string) => string)) => void;
}

const Gift: React.FC<PageType> = (props: PageType) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.menu}>
          <div className={styles.left}>
            <img
              src="/images/backArrow.svg"
              alt="Icon"
              onClick={() => {
                props.changePageHandle("main");
              }}
            />
            <span>Gift Token</span>
          </div>
          <div className={styles.right} />
        </div>
      </header>
      <div className={styles.content}>
        <img src="/images/bigpig.svg" alt="Icon" />
        <span>
          With more usage time, more tokens you guarantee, currently you have:
        </span>
        <div className={styles.toReceive}>
          <img src="/images/hopr.svg" alt="HOPR" />
          <span>00 HOPR</span>
        </div>
        <div className={styles.button}>Collect Token</div>
      </div>
      <div className={styles.footer}>
        <span>By</span>
        <img src="/images/metamath.svg" alt="MetaMath" />
        <div className={styles.resizer} />
      </div>
    </div>
  );
};

export default Gift;
