import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react';
import SmokPanel from "./smoke-panel";
import type { Project } from "@/app/type";
import { Modal } from "antd-mobile";
import BoostVip from "../boost/boostVip";
import { useUser } from "@/app/store/useUser";
import { useAccount } from "@/app/hooks/useAccount";
import BoostSuperNoTimes from "../boost/boostSuperNoTimes";
import { usePrepaidDelayTimeStore } from "@/app/store/usePrepaidDelayTime";
import SmokeButton from "./smoke-button";
import Big from "big.js";
import { useTokenTrade } from "@/app/hooks/useTokenTrade";
import { numberFormatter } from "@/app/utils/common";
import { useSmokeHotStore } from '@/app/components/smokHot/store';

const isPrepaidCache = new Map<string, any>();
interface Props {
  token: Project;
  isBigIcon?: boolean;
  id?: string;
  onClick: () => void;
  actionChildren?: any;
  content?: React.ReactNode;
  isLaptopModal?: boolean;
  onHide?: () => void;
  onSuccess?(): void;
  onOpenClick?(): void;
}

function SmokeBtn({
  onClick,
  token,
  isBigIcon = false,
  actionChildren,
  content,
  onHide,
  id,
  onSuccess,
  isLaptopModal,
  onOpenClick
}: Props, ref: any) {
  const {
    panelShow,
    setPanelShow,
    vipShow,
    setVipShow,
    flipNum,
    setFlipNum,
  } = useSmokeHotStore();

  const { userInfo }: any = useUser();
  const { address } = useAccount();
  const [reFresh, setRefresh] = useState(1);
  const [boostSuperNoTimesShow, setBoostSuperNoTimesShow] = useState(false);
  // const { prepaidDelayTime } = usePrepaidDelayTimeStore();

  const { pool, checkPrePayed } = useTokenTrade({
    tokenName: token?.tokenName as string,
    tokenSymbol: token?.tokenSymbol as string,
    tokenDecimals: token?.tokenDecimals as number,
    loadData: false
  });

  useEffect(() => {
    checkPrePayed().then((res) => {
      setFlipNum(res);
    })
  }, [pool]);
  
  // const isDelay = useMemo(() => {
  //   if (
  //     prepaidDelayTime &&
  //     token.createdAt &&
  //     Date.now() - token.createdAt > prepaidDelayTime
  //   ) {
  //     return true;
  //   }
  //   return false;
  // }, [prepaidDelayTime, token]);

  const isDisabled = useMemo(() => {
    return token.isSuperLike || token.account === address || Number((token as any).total_amount) > 0 || isPrepaidCache.get(token.address!);
  }, [token, address, reFresh]);

  const disabledText = useMemo(() => {
    if (!isDisabled) {
      return ''
    }
    
    if (Number((token as any).total_amount) > 0 || isPrepaidCache.get(token.address!)) {
      const flipNumFormatted = numberFormatter(((token as any).total_amount || isPrepaidCache.get(token.address!)).toString(), 4, true)
      return 'Fliped <br/>' + flipNumFormatted + 'SOL'
    }

    if (token.account === address) {
      return 'Flipped'
    }

    return 'Flipped'
  }, [token, address, flipNum, isDisabled, reFresh])

  const VipModal = (
    <BoostVip
      onStartVip={() => {
        setPanelShow(true);
      }}
      onCanceVip={() => {
        setVipShow(false);
      }}
    />
  );

  const BoostSuperNoTimesModal = (
    <BoostSuperNoTimes
      token={token}
      usingNum={userInfo?.usingBoostNum}
      num={userInfo?.superLikeNum}
      onClose={() => {
        setBoostSuperNoTimesShow(false);
      }}
      type={2}
    />
  );

  const size = isBigIcon ? 48 : 36;

  const onButtonClick = () => {
    if (!address) {
      window.connect();
      return;
    }

    if (isDisabled) {
      return;
    }
    setPanelShow(true);
    onOpenClick?.();
  };

  const refs = {
    setPanelShow,
  };
  useImperativeHandle(ref, () => refs);

  return (
    <>
      {actionChildren ? (
        <div className="button" onClick={onButtonClick}>
          {typeof actionChildren === "function" ? actionChildren({ disabled: isDisabled }) : actionChildren}
        </div>
      ) : (
        <SmokeButton
          {...{ size, id, address, token, isDisabled, disabledText }}
          onClick={onButtonClick}
        />
      )}

      <Modal
        visible={vipShow}
        content={VipModal}
        closeOnAction
        closeOnMaskClick
        onClose={() => {
          setVipShow(false);
        }}
      />

      <SmokPanel
        token={token}
        show={panelShow}
        onSuccess={(number: string) => {
          isPrepaidCache.set(token.address!, number);
          onClick && onClick();
          setRefresh(reFresh + 1);
          setPanelShow(false);
          onSuccess?.();
        }}
        onHide={() => {
          setPanelShow(false);
        }}
        isLaptopModal={isLaptopModal}
      />

      <Modal
        visible={boostSuperNoTimesShow}
        content={BoostSuperNoTimesModal}
        closeOnMaskClick
        closeOnAction
        onClose={() => {
          setBoostSuperNoTimesShow(false);
        }}
      />
    </>
  );
}

export default React.forwardRef(SmokeBtn);
