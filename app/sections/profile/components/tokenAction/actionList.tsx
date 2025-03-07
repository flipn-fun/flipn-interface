import type { Project } from "@/app/type";
import styles from "./index.module.css";
import SmokeHot from "@/app/components/smokHot";
import { useRef, useState } from 'react';
import BuySell from "./buySell";
import Withdraw from "./withdraw";
import Claim from "./claim";
import Big from "big.js";
import { useUserAgent } from "@/app/context/user-agent";
import { useTokenActions } from '@/app/sections/profile/token-context';

interface Props {
  token: Project;
  isOther: boolean;
  isDelay: boolean;
  prepaidWithdrawDelayTime: number;
  prepaidRealAmount: Big.Big;
  prepaidAmount: Big.Big;
  smookeable: false | 1 | 2;
  showWithdraw: boolean;
  isPrepaid: boolean;
  prepaidSolWithdraw: any;
  prepaidTokenWithdraw: any;
  tokenAmount: Big.Big;
  onWithdrawSuccess?(): void;
}

export default function ActionList(props: Props) {
  const {
    token,
    isOther,
    onWithdrawSuccess,
    smookeable,
    showWithdraw,
    isPrepaid,
    prepaidSolWithdraw,
    prepaidTokenWithdraw,
    isDelay
  } = props;

  const { isMobile } = useUserAgent();
  const { onCloseTradeModal } = useTokenActions();

  const smokeHotRef = useRef<any>();

  const [isClaimed, setIsClaimed] = useState(false);

  return (
    <div className={isMobile ? styles.BtnsMobile : styles.Btns}>
      {token.status === 0 && (
        <>
          {
            // fix#REF-9370
            showWithdraw ? (
              <Withdraw
                {...props}
                onSuccess={onWithdrawSuccess}
                prepaidSolWithdraw={prepaidSolWithdraw}
              />
            ) : (
              <>
                {!!smookeable &&
                  (smookeable === 1 ? (
                    !isDelay && (
                      <button
                        className={`${styles.ActionBtn} ${styles.ProfileFlipDisabled} button`}
                      >
                        <span>Flipped</span>
                      </button>
                    )
                  ) : (
                    <SmokeHot
                      ref={smokeHotRef}
                      actionChildren={(_params: any) => (
                        <button
                          className={`${styles.ActionBtn} ${styles.ProfileFlip} button`}
                          disabled={_params.disabled}
                        >
                          <img
                            src="/img/profile/icon-flip.svg"
                            alt=""
                            width="17px"
                            height="21px"
                          />
                          <span>Flip</span>
                        </button>
                      )}
                      token={token}
                      onClick={() => {}}
                      onSuccess={onWithdrawSuccess}
                      isLaptopModal={true}
                      onOpenClick={() => {
                        onCloseTradeModal?.();
                      }}
                    />
                  ))}
              </>
            )
          }
        </>
      )}

      {[1, 2, 3].includes(Number(token.status)) && isPrepaid && !isOther && (
        <Claim
          {...props}
          isClaimed={isClaimed}
          setIsClaimed={setIsClaimed}
          prepaidTokenWithdraw={prepaidTokenWithdraw}
        />
      )}

      {[1, 3].includes(Number(token.status)) &&
        (!(isPrepaid && !isOther) || isClaimed) && (
          <BuySell
            token={token}
            onOpenClick={() => {
              smokeHotRef.current?.setPanelShow?.(false);
            }}
          />
        )}
    </div>
  );
}
