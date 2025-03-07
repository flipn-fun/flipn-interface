import styles from "./index.module.css";
import CouponCard from '@/app/sections/invite-code/components/coupon-card';
import React from 'react';
import { formatLongText } from '@/app/utils/common';
import { useWalletModal } from '@/app/libs/solana/wallet-adapter/modal';
import { removeAuth } from '@/app/utils';

const InviterConnect = (props: any) => {
  const { className } = props;

  const { visible, setVisible } = useWalletModal();

  const handleConnect = () => {
    removeAuth();
    setVisible(!visible);
  };

  return (
    <CouponCard
      className={className}
      disabled={false}
      loading={false}
      onClick={handleConnect}
      buttonText="Connect Wallet"
    >
      <div className={styles.InviterContainer}>
        <div className={styles.InviterLabel}>
          Inviter:
        </div>
        <div className={styles.InviterAvatarWrapper}>
          <img src="/img/token-icon-placeholder.svg" alt="" className={styles.InviterAvatar} />
        </div>
        <div className={styles.InviterName}>
          {formatLongText("Baddies 🐸", 10, 8)}
        </div>
      </div>
    </CouponCard>
  );
};

export default InviterConnect;
