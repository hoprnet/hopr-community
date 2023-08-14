import React from "react";
import styles from "./style.module.scss";

interface ComponentType {
  text: string;
  id: string;
}

const Sent: React.FC<ComponentType> = (props: ComponentType) => {
  return (
    <div className={styles.container} key={props.id}>
      <div className={styles.message}>
        <div className={styles.wrapper}>
          <span>{props.text}</span>
        </div>
      </div>
    </div>
  );
};

export default Sent;
