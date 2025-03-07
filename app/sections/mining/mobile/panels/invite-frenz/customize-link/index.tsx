import Modal from "@/app/components/modal";
import styles from "./index.module.css";
import clsx from "clsx";
import { useUserAgent } from "@/app/context/user-agent";
import { useState } from "react";

export default function CustomizeLink({ show, onClose }: any) {
  const { isMobile } = useUserAgent();
  const [inputVal, setInputVal] = useState("");

  return (
    <Modal
      open={show}
      onClose={onClose}
      animation={isMobile ? "popup" : "modal"}
      forceNoCloseIcon={isMobile}
    >
      <div
        className={styles.Container}
        style={{
          borderRadius: isMobile ? "20px 20px 0px 0px" : 20
        }}
      >
        <div className={styles.Header}>
          <span>Customize my invite link</span>
        </div>
        <div className={styles.InputHeader}>
          <div className={styles.BasicLink}>app.flipn.fun/ref/</div>
          <div className={styles.Amount}>{20 - inputVal.length}</div>
        </div>
        <input
          className={`${styles.Input} ${styles.InputError}`}
          placeholder="Please enter your own invite link"
        />
        <div className={styles.ErrorHints}>This link has been used</div>
        <div className={styles.Bottom}>
          <div className={styles.Hints}>Can be customized only once</div>
          <button className={clsx(styles.Button, "button")} onClick={() => {}}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
