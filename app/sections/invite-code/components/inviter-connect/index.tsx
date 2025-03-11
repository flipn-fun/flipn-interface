import styles from "./index.module.css";
import CouponCard from "@/app/sections/invite-code/components/coupon-card";
import React, { useEffect, useMemo, useRef } from "react";
import { formatLongText } from "@/app/utils/common";
import { useWalletModal } from "@/app/libs/solana/wallet-adapter/modal";
import { removeAuth } from "@/app/utils";
import { useSearchParams } from "next/navigation";
import { useAccount } from "@/app/hooks/useAccount";
import { useAuth } from "@/app/context/auth";
import { useBind } from "@/app/sections/invite-code/hooks/use-bind";
import { useAirdropContext } from "@/app/context/airdrop";
import { INVITERS } from '@/app/config/invite';

const InviterConnect = (props: any) => {
  const { className, type } = props;

  const staticInviter = INVITERS[type];

  const { visible, setVisible } = useWalletModal();
  const params = useSearchParams();
  const { address } = useAccount();
  const { accountRefresher } = useAuth();
  const { pending, codeValid, codeValidMessage, handleBindDelay } = useBind();
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
    removeAuth();
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
        <div className={styles.InviterLabel}>Inviter:</div>
        <div className={styles.InviterAvatarWrapper}>
          <img
            src={staticInviter ? staticInviter.logo : "/img/token-icon-placeholder.svg"}
            alt=""
            className={styles.InviterAvatar}
          />
        </div>
        <div className={styles.InviterName}>
          {formatLongText(staticInviter ? staticInviter.name : "Baddies 🐸", 10, 8)}
        </div>
      </div>
    </CouponCard>
  );
};

export default InviterConnect;
