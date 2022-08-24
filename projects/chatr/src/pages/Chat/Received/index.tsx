import React from "react";
import styles from "./styles.module.scss";

interface ComponentType {
  text: string;
  id: string;
}

const Received: React.FC<ComponentType> = (props: ComponentType) => {
  return (
    <div className={styles.container} key={props.id}>
      <div className={styles.icon}>
        <img src="/images/user2.svg" alt="Icon" />
      </div>
      <div className={styles.message}>
        <div className={styles.wrapper}>
          <span>{props.text}</span>
        </div>
      </div>
    </div>
  );
};

export default Received;
