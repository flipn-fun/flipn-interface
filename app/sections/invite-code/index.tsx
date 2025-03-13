"use client";

import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import InviteCodeConnectWallet from "@/app/sections/invite-code/components/connetct-wallet";
import Social from "@/app/sections/invite-code/components/social";
import InviteCodeForm from "@/app/sections/invite-code/components/form";
import { useAccount } from "@/app/hooks/useAccount";
import { useAuth } from "@/app/context/auth";
import { useDebounceFn } from "ahooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAirdropContext } from "@/app/context/airdrop";
import { useUserAgent } from "@/app/context/user-agent";
import InviterConnect from "@/app/sections/invite-code/components/inviter-connect";

const IS_INVITE_LINK = true;

const InviteCodeView: React.FC<any> = (props) => {
  const { type } = props;

  const { address } = useAccount();
  const { accountRefresher } = useAuth();
  const router = useRouter();
  const { airdropDataLoading, airdropUserData } = useAirdropContext();
  const { isMobile } = useUserAgent();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [pageLoading, setPageLoading] = useState(true);

  const { run: setPageLoadingDelay, cancel: setPageLoadingDelayCancel } =
    useDebounceFn(
      () => {
        setPageLoading(false);
      },
      { wait: 300 }
    );

  useEffect(() => {
    setPageLoadingDelayCancel();
    if (!address || !accountRefresher) {
      setPageLoadingDelay();
      return;
    }
    setPageLoading(false);
  }, [address, accountRefresher]);

  useEffect(() => {
    if (airdropUserData?.allow_login && pathname === "/invite-code") {
      const redirectTarget = searchParams.get("redirect");
      router.replace(redirectTarget || "/");
    }
  }, [airdropUserData, pathname]);

  useEffect(() => {
    // Close the login modal
    window.connect?.();
  }, []);

  return (
    <div
      className={
        isMobile ? styles.inviteCodeContainer : styles.inviteCodeContainerLaptop
      }
    >
      {!IS_INVITE_LINK
        ? !pageLoading &&
          (!address ||
          !accountRefresher ||
          airdropDataLoading ||
          airdropUserData?.allow_login ? (
            <InviteCodeConnectWallet
              loading={pageLoading || airdropDataLoading}
            />
          ) : (
            <InviteCodeForm />
          ))
        : !pageLoading && <InviterConnect />}
      <Social />
    </div>
  );
};

export default InviteCodeView;
