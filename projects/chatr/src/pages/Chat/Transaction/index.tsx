import React from "react";
import styles from "./style.module.scss";

interface ComponentType {
  quantity: number;
}

const Transaction: React.FC<ComponentType> = (props: ComponentType) => {
  return (
    <div className={styles.container}>
      <div className={styles.message}>
        <div className={styles.wrapper}>
          <img src="/images/hopr.svg" alt="icon" />
          <span>{props.quantity}.00 HOPR</span>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
