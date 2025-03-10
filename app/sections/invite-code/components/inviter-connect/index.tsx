import styles from "./index.module.css";
import CouponCard from '@/app/sections/invite-code/components/coupon-card';
import React, { useEffect, useMemo, useRef } from 'react';
import { formatLongText } from '@/app/utils/common';
import { useWalletModal } from '@/app/libs/solana/wallet-adapter/modal';
import { removeAuth } from '@/app/utils';
import { useParams } from 'next/navigation';
import { useAccount } from '@/app/hooks/useAccount';
import { useAuth } from '@/app/context/auth';
import { useBind } from '@/app/sections/invite-code/hooks/use-bind';
import { useAirdropContext } from '@/app/context/airdrop';

const InviterConnect = (props: any) => {
  const { className } = props;

  const { visible, setVisible } = useWalletModal();
  const params = useParams();
  const { address } = useAccount();
  const { accountRefresher } = useAuth();
  const {
    pending,
    codeValid,
    codeValidMessage,
    handleBindDelay,
  } = useBind();
  const { getAirdropData } = useAirdropContext();

  const inviteCode = params.code as string;

  const couponCardRef = useRef<any>();

  const buttonText = useMemo(() => {
    if (!address || !accountRefresher) {
      return "Connect Wallet";
    }
    if (typeof codeValid === "boolean") {
      return codeValid ? "Starting..." : "Invalid Code";
    }
    return "Binding...";
  }, [address, accountRefresher, codeValid]);

  const handleConnect = () => {
    removeAuth();
    setVisible(!visible);
  };

  useEffect(() => {
    if (typeof codeValid === "boolean") {
      couponCardRef.current?.setIsStarted?.(true);
    }
  }, [codeValid]);

  useEffect(() => {
    if (!address || !accountRefresher) {
      return;
    }
    if (!inviteCode) {
      return;
    }
    // Bind inviter
    handleBindDelay(inviteCode);
  }, [address, accountRefresher, inviteCode]);

  useEffect(() => {
    if (!codeValid) {
      return;
    }
    // check bind
    getAirdropData?.();
  }, [codeValid]);

  return (
    <CouponCard
      ref={couponCardRef}
      className={className}
      disabled={pending || (address && accountRefresher)}
      loading={pending}
      onClick={handleConnect}
      buttonText={buttonText}
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
