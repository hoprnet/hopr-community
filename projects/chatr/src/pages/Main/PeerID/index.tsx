import React, { useState } from "react";
import useAppState, { Settings } from "./../../../state/index";
import useUser from "./../../../state/user";
import styles from "./styles.module.scss";

const PeerID: React.FC = () => {
  const settings = useAppState().state.settings as Settings;
  const myUserState = useUser(settings);
  const myPeerId = myUserState?.state.myPeerId || "Can't Fetch PeerID";
  

  const [isDoing, setIsDoing] = useState(false);

  const copyAnimation = () => {
    const icon = document.getElementById("copyIcon") as HTMLImageElement;

    if (icon && !isDoing) {
      setIsDoing(true);
      icon.style.transform = "rotate(40deg)";

      setTimeout(() => {
        icon.style.transform = "rotate(-360deg)";
      }, 300);

      setTimeout(() => {
        icon.src = "/images/checkDark.svg";
        icon.style.transform = "rotate(-370deg)";
      }, 400);

      setTimeout(() => {
        icon.style.transform = "rotate(0deg)";
      }, 1000);

      setTimeout(() => {
        icon.src = "/images/copyDark.svg";
        setIsDoing(false);
      }, 1200);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.data}>
        <span>Your Peer ID is:</span>
        <div className={styles.id}>
          <span>{myPeerId}</span>
        </div>
        <div className={styles.pointer}>
          <img
            onClick={() => {
              navigator.clipboard.writeText(myPeerId);
              copyAnimation();
            }}
            id="copyIcon"
            src="/images/copyDark.svg"
            alt="Icon"
          />
        </div>
      </div>
      <div className={styles.divisor} />
    </div>
  );
};

export default PeerID;
