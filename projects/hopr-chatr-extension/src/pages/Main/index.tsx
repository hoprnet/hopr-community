import React, { useEffect, useState } from "react";
import { isValidPeerId } from "../../utils";
import ContactList from "./ContactList";
import Message from "./Message";
import styles from "./style.module.scss";

interface MainType {
  changeChatWith: (value: string | ((prevVar: string) => string)) => void;
  changePageHandle: (value: string | ((prevVar: string) => string)) => void;
}

const Main: React.FC<MainType> = (props: MainType) => {

  /* 
  @Phillipe - Stage description
  
  0 - Loading
  1 - Not configured yet
  2 - Get Started
  3 - Contacts list
  */

  const [stage, setStage] = useState(0);
  const [data, setData] = useState([""]);
  const [notifications, setNotifications] = useState([""]);

  useEffect(() => {
    if (localStorage) {
      const data = localStorage.getItem("data");
      const contacts = localStorage.getItem("contacts");
      const aliases = localStorage.getItem("aliases");

      if (data) {
        const parsed = JSON.parse(data);
        if (
          parsed.HTTPEndpoint !== "" &&
          parsed.WSEndpoint !== "" &&
          parsed.SecurityToken !== ""
        ) {
          if (contacts) {
            if (contacts.includes("null")) {
              setStage(2);
            } else {
              setData(contacts.split(","));
              setStage(3);
            }
          } else {
            localStorage.setItem("contacts", "null");
          }

          if (!aliases) {
            localStorage.setItem("aliases", "[]");
          }
        } else {
          setStage(1);
          setNotifications(["settings"]);
        }
      } else {
        setStage(1);
        setNotifications(["settings"]);
      }
    }
  }, []);

  const addContact = async (wallet: string) => {
    var contacts = [""];
    const searchElement = document.getElementById("search");
    const walletInput = document.getElementById(
      "walletInput"
    ) as HTMLInputElement;

    if (!isValidPeerId(wallet)) {
      if (searchElement && walletInput) {
        var lastValue = walletInput.value;
        walletInput.value = "Invalid address!";
        walletInput.placeholder = "Invalid address!";
        walletInput.disabled = true;
        searchElement.style.outline = "1.5px solid red";

        setTimeout(() => {
          searchElement.style.outline = "1.5px solid transparent";
          walletInput.value = lastValue;
          walletInput.placeholder = "Add a new contact";
          walletInput.disabled = false;
          lastValue = "";
        }, 1500);
      }
    } else {
      if (localStorage && searchElement) {
        contacts = localStorage.getItem("contacts")!.split(",");
        if (contacts.includes(wallet)) {
          setData(contacts);
          setStage(3);

          var lastValue = walletInput.value;
          walletInput.value = "Address already added!";
          walletInput.placeholder = "Address already added!";
          walletInput.disabled = true;
          searchElement.style.outline = "1.5px solid red";

          setTimeout(() => {
            searchElement.style.outline = "1.5px solid transparent";
            walletInput.value = lastValue;
            walletInput.placeholder = "Add a new contact";
            walletInput.disabled = false;
            lastValue = "";
          }, 1500);
        } else {
          if (contacts.includes("null")) {
            contacts.shift();
            contacts.push(wallet);
            localStorage.setItem("contacts", contacts.toString());
            window.location.reload();
          } else {
            contacts.push(wallet);
            localStorage.setItem("contacts", contacts.toString());
            window.location.reload();
          }
        }
      }
    }
  };

  const removeContact = async (wallet: any) => {
    var contacts = [""];

    if (localStorage) {
      contacts = localStorage.getItem("contacts")!.split(",");
      if (contacts.includes(wallet)) {
        const index = contacts.indexOf(wallet);
        if (index > -1) {
          contacts.splice(index, 1);
          localStorage.setItem("contacts", contacts.toString());
          setData(contacts);
          setStage(3);
          // window.location.reload();
        }
      }
    }
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.menu}>
          <div className={styles.left}>Chatr</div>
          <div className={styles.right}>
            {/* {notifications.includes("gift") ? (
              <img
                src="/images/giftNotification.svg"
                alt="Icon"
                onClick={() => props.changePageHandle("gift")}
              />
            ) : (
              <img
                src="/images/gift.svg"
                alt="Icon"
                onClick={() => {
                  props.changePageHandle("gift");
                }}
              />
            )} */}
            {notifications.includes("wallet") ? (
              <img
                src="/images/walletNotification.svg"
                alt="Icon"
                onClick={() => props.changePageHandle("wallet")}
              />
            ) : (
              <img
                src="/images/wallet.svg"
                alt="Icon"
                onClick={() => props.changePageHandle("wallet")}
              />
            )}
            {notifications.includes("settings") ? (
              <img
                src="/images/gearNotification.svg"
                alt="Icon"
                onClick={() => props.changePageHandle("settings")}
              />
            ) : (
              <img
                src="/images/gear.svg"
                alt="Icon"
                onClick={() => props.changePageHandle("settings")}
              />
            )}
          </div>
        </div>
        <div className={styles.search}>
          <div className={styles.bar} id="search">
            <input
              type="text"
              placeholder="Add a new contact"
              id="walletInput"
            />
            <div className={styles.icon}>
              <img
                src="/images/plus.svg"
                alt="Icon"
                onClick={() =>
                  addContact(
                    (document.getElementById("walletInput") as HTMLInputElement)
                      .value
                  )
                }
              />
            </div>
          </div>
        </div>
      </header>
      <div className={styles.content}>
        {stage === 0 && (
          <img
            src="/images/loading.gif"
            alt="Loading"
            style={{ width: "40px" }}
          />
        )}
        {stage === 1 && (
          <Message
            icon="gear2"
            text="Your settings are not complete, please complete to continue."
            button={{ image: "superarrow" }}
            action={props.changePageHandle}
          />
        )}
        {stage === 2 && (
          <Message
            icon="search"
            text="Don't know how to chat and send your tokens? search wallet ID to get
        started"
          />
        )}
        {stage === 3 && (
          <ContactList
            data={data}
            changeChatWith={props.changeChatWith}
            changePageHandle={props.changePageHandle}
            removeContact={removeContact}
          />
        )}
      </div>
      <div className={styles.footer}>
        <span>By</span>
        <img src="/images/metamath.svg" alt="MetaMath" />
        <div className={styles.resizer} />
      </div>
    </div>
  );
};

export default Main;
