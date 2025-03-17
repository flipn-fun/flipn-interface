"use client";

import styles from "./layout.module.css";
import useNotice from "../../../hooks/use-notice";
import { useShare } from "../../../hooks/use-share";
import Tabs from "./tabs";
import Refer from "@/app/components/layout/laptop/user/refer";
import ClaimModal from "@/app/sections/profile/components/tokenAction/claim/modal";
import { useAuth } from "@/app/context/auth";

export default function Component({ children }: any) {
  const { claimToken, setClaimToken, prepaidTokenWithdraw } = useNotice();
  useShare();
  const { userInfo } = useAuth();

  return (
    <div className={styles.Main} id="main-content">
      {children}
      <Refer userInfo={userInfo} isMobile />
      <Tabs />
      {/* {isRefer && <ReferContentCard />} */}
      <ClaimModal
        visible={!!claimToken}
        onClose={() => {
          setClaimToken(null);
        }}
        token={claimToken}
        prepaidTokenWithdraw={prepaidTokenWithdraw}
        prepaidAmount={claimToken?.prepaidAmount}
        tokenAmount={claimToken?.tokenAmount}
      />
    </div>
  );
}
