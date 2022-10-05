import React from "react";
import styles from "./styles.module.scss";

const Github: React.FC = () => {
  return (
    <div className={styles.github}>
      <img
        src="/images/github.svg"
        alt="Github"
        onClick={() =>
          window.open("https://github.com/metamathstudios/hopr-gate")
        }
      />
    </div>
  );
};

export default Github;
