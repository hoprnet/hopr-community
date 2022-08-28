import styles from "./style.module.scss";
import useAppState, { Transaction, Settings } from "../../../state";
import { sendTransaction } from "../../../lib/api";
import { useEffect, useState } from "react";


interface PageType {
  amountToSend: string;
  destinationAddress: string;
  changePageHandle: (value: string | ((prevVar: string) => string)) => void;
  changeDestination: (value: string | ((prevVar: string) => string)) => void;
  changeAmountToSend: (value: string | ((prevVar: string) => string)) => void;
}

const Send = (props: PageType) => {
  const settings = useAppState().state.settings as Settings;
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept-Content", "application/json");

  if (settings.securityToken) {
    headers.set("Authorization", "Basic " + btoa(settings.securityToken));
  }

  const transaction: Transaction = {
    currency: "HOPR",
    amount: (Number(props.amountToSend)*1e18).toString(),
    recipient: props.destinationAddress,
  };


  sendTransaction(settings.httpEndpoint,headers)(transaction).then((res) => {
    console.log(res);
    if(res == "SUCCESS") return props.changePageHandle("sendConfirm");
    if(res == "FAILURE") return props.changePageHandle("sendError");
  }).catch((err) => {
    console.log(err);
    return props.changePageHandle("sendError");
  });
 

  return (
    console.log(props.amountToSend),
    console.log(props.destinationAddress),
    (
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
          <>
            <div className={styles.loader}>
              <img src="/images/rotatingarrow.svg" alt="HOPR" />
            </div>
            <span className={styles.title}>
              Sending...
            </span>
          </>
        </div>
        <div className={styles.footer}>
          <span>By</span>
          <img src="/images/metamath.svg" alt="MetaMath" />
          <div className={styles.resizer} />
        </div>
      </div>
    )
  );
};

export default Send;
