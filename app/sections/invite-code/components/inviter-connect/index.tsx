import styles from "./index.module.css";
import CouponCard from "@/app/sections/invite-code/components/coupon-card";
import React, { useEffect, useMemo, useRef } from "react";
import { formatLongText } from "@/app/utils/common";
import { useWalletModal } from "@/app/libs/solana/wallet-adapter/modal";
import { useSearchParams } from "next/navigation";
import { useAccount } from "@/app/hooks/useAccount";
import { useAuth } from "@/app/context/auth";
import { useBind } from "@/app/sections/invite-code/hooks/use-bind";
import { useAirdropContext } from "@/app/context/airdrop";
import { INVITERS } from '@/app/config/invite';
import { Skeleton } from 'antd-mobile';
import clsx from 'clsx';

const InviterConnect = (props: any) => {
  const { className, type } = props;

  const staticInviter = INVITERS[type];

  const { visible, setVisible } = useWalletModal();
  const params = useSearchParams();
  const { address } = useAccount();
  const { accountRefresher, logout } = useAuth();
  const {
    pending,
    codeValid,
    codeValidMessage,
    handleBindDelay,
    inviterData,
    loadingInviterData,
    setLoadingInviterData,
    getInviterByCode
  } = useBind();
  const { getAirdropData } = useAirdropContext();

  const inviteCode = staticInviter?.code ?? params.get("code") as string;

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
    logout();
    setVisible(!visible);
  };

  useEffect(() => {
    if (!address || !accountRefresher) {
      couponCardRef.current?.setIsStarted?.(false);
      return;
    }
    if (typeof codeValid === "boolean") {
      couponCardRef.current?.setIsStarted?.(true);
    }
  }, [codeValid, address, accountRefresher]);

  useEffect(() => {
    if (!address || !accountRefresher) {
      return;
    }
    if (!inviteCode || loadingInviterData) {
      return;
    }
    // Bind inviter
    handleBindDelay(inviteCode);
  }, [address, accountRefresher, inviteCode, loadingInviterData]);

  useEffect(() => {
    if (!codeValid) {
      return;
    }
    // check bind
    getAirdropData?.();
  }, [codeValid]);

  useEffect(() => {
    if (!inviteCode || !!staticInviter) {
      setLoadingInviterData(false);
      return;
    }
    getInviterByCode(inviteCode);
  }, [inviteCode, staticInviter]);

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
        <div className={styles.InviterLabel}>Inviter:</div>
        <div className={clsx((!staticInviter && !inviterData?.account_icon) ? styles.InviterAvatarWrapperEmpty : styles.InviterAvatarWrapper)}>
          {
            loadingInviterData ? (
              <Skeleton
                animated
                className={styles.InviterAvatarLoading}
              />
            ) : (
              <img
                src={staticInviter ? staticInviter.logo : (inviterData?.account_icon || "/img/avatar.png")}
                alt=""
                className={styles.InviterAvatar}
              />
            )
          }
        </div>
        <div className={styles.InviterName}>
          {
            loadingInviterData ? (
              <Skeleton
                animated
                className={styles.InviterNameLoading}
              />
            ) : formatLongText(staticInviter ? staticInviter.name : (inviterData?.account_name || "Unknown"), 10, 8)
          }
        </div>
      </div>
    </CouponCard>
  );
};

export default InviterConnect;
