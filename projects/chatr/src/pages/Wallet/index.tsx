import React from "react";
import styles from "./style.module.scss";
import useAppState, { Settings } from "./../../state/index";
import useUser from "./../../state/user";

interface PageType {
  changePageHandle: (value: string | ((prevVar: string) => string)) => void;
}

const Wallet: React.FC<PageType> = (props: PageType) => {

  const settings = useAppState().state.settings as Settings;
  const myUserState = useUser(settings);
  const hoprBalance = Number(myUserState?.balances.hopr)/1e18 || 0;

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
            <span>Wallet</span>
          </div>
          <div className={styles.right} />
        </div>
      </header>
      <div className={styles.content}>
        <div className={styles.wallet}>
          <div className={styles.icon}>
            <img src="/images/hopr.svg" alt="HOPR" />
          </div>
          <div className={styles.text}>
            Hopr Token <span>{hoprBalance} HOPR</span>
          </div>
          <div className={styles.actions}>
            <img
              src="/images/receive.svg"
              alt="HOPR"
              onClick={() => props.changePageHandle("transfer")}
            />
            <img
              src="/images/send.svg"
              alt="HOPR"
              onClick={() => props.changePageHandle("send")}
            />
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

export default Wallet;
