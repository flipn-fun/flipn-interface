import styles from "./index.module.css";
import React from "react";

export const ToastMsg = (props: any) => {
  const { title, msg, isSuccess } = props;

  return (
    <div className={isSuccess ? styles.InviteCodeFormToastSuccess : styles.InviteCodeFormToast}>
      <div className={styles.InviteCodeFormToastTitle}>
        {title}
      </div>
      <div className={styles.InviteCodeFormToastMsg}>
        {msg}
      </div>
    </div>
  );
};
