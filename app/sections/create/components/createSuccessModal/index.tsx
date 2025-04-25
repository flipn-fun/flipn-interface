import style from "./index.module.css";
import MainBtn from "@/app/components/mainBtn";
import type { Project } from "@/app/type";

import { httpGet } from "@/app/utils";
import { useCallback, useEffect, useState } from "react";
import { useUserAgent } from "@/app/context/user-agent";
import { shareToX } from "@/app/utils/share";
import { useMessage } from "@/app/context/messageContext";
import { mapDataToProject } from "@/app/utils/mapTo";
import Modal from "@/app/components/modal";
import { useRouter } from "next/navigation";
import { numberFormatter } from "@/app/utils/common";
// @ts-ignore
import confetti from "canvas-confetti";
import { useInterval } from "ahooks";
import SpinLoading from "antd-mobile/es/components/spin-loading";

interface Props {
  show: boolean;
  onHide: () => void;
  token: Project;
  data: Project;
  pointByVolume: string | undefined;
  onShare: () => void;
}

export default function CreateSuccessModal({
  show,
  onHide,
  token,
  data,
  pointByVolume,
  onShare
}: Props) {
  const { isMobile } = useUserAgent();

  if (!isMobile && show) {
    return (
      <SuccessModal
        token={token}
        data={data}
        pointByVolume={pointByVolume}
        onClose={() => {
          onHide();
        }}
        onShare={onShare}
      />
    );
  }

  return (
    <div className={style.ModalMain}>
      <Modal
        forceNoCloseIcon={true}
        open={show}
        onClose={() => {
          onHide();
        }}
      >
        <SuccessModal
          token={token}
          data={data}
          pointByVolume={pointByVolume}
          onClose={() => {
            onHide();
          }}
          onShare={onShare}
        />
      </Modal>
    </div>
  );
}

const MEMETICS: any = {
  'Raydium': 1338.75,
  'FlipN': 4614.75
}

function SuccessModal({
  onClose,
  onShare,
  pointByVolume,
  token,
  data
}: {
  onClose: () => void;
  token: any;
  data: Project;
  onShare: () => void;
  pointByVolume: string | undefined;
}) {
  const { isMobile } = useUserAgent();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)

  const launchConfetti = useCallback(() => {
    if (token) {
      confetti({
        particleCount: 500,
        spread: 100,
        origin: { y: 0.6, x: 0.5 },
        zIndex: 99999
      });
    }
  }, [token]);

  useInterval(
    () => {
      launchConfetti();
    },
    1000,
    { immediate: true }
  );

  return (
    <div
      className={
        style.main + " " + (isMobile ? style.mainMobile : style.mainPc)
      }
      style={{ width: isMobile ? "90vw" : 432 }}
    >
      <div className={style.tokenInfo}>
        {
          isMobile && <div className={style.platformImg}>
            <img src={data.platform.img} alt={data.platform.name} />
          </div>
        }

        <div className={style.tokenTitle}>Token is live!</div>
        <div className={style.tokenAmount}>
          You will get
          <span className={style.tokenSymbol}>
            {" "}
            {numberFormatter(MEMETICS[data.platform.name], 4, true)} MEMETICS{" "}
          </span>
          when this token hit bonding curve.
        </div>
      </div>

      <div className={style.content}>
        <div className={style.avatarBox}>
          <div className={style.avatar}>
            <img
              className={style.avatarImg}
              src={token.tokenUri || token.tokenIcon || token.tokenImg}
            />
          </div>
          {
            !isMobile && <div className={style.platformPcImg}>
              <img src={data.platform.img} className={style.pcImg} alt={data.platform.name} />
            </div>
          }
        </div>


        <div className={style.nameContent}>
          <div className={style.time} style={{ visibility: 'hidden' }}>3:00:00</div>
          <div className={style.name}>{token.tokenName}</div>
          <div className={style.ticker}>Ticker: {token.tokenSymbol}</div>
        </div>

        {
          data.platform.name === 'FlipN' && (
            <div className={style.successNote}>
              Collect 100 Likes to Bonding now!
            </div>
          )
        }

        <div className={style.btnBox}>
          <MainBtn
            onClick={async () => {
              if (isLoading) {
                return
              } 
              setIsLoading(true)
              await onShare();
              isMobile && onClose();
              setIsLoading(false)
            }}
            style={{
              fontWeight: isMobile ? 500 : 700,
              background: isMobile ? "#000000" : "#FBCA04",
              color: isMobile ? "#FBCA04" : "#000000"
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>{isLoading ? <SpinLoading
              color="#9290B1"
              style={{ "--size": "14px" }}
            /> : 'Share'}</div>
          </MainBtn>
          
        </div>
      </div>

      <div
        className={`${style.close} button`}
        onClick={() => {
          router.push("/");
          onClose();
        }}
      >
        Back to Home
      </div>
    </div>
  );
}
