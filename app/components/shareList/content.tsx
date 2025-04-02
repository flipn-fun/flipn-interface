import { useUserAgent } from "@/app/context/user-agent";
import styles from "./index.module.css";
import usePhyllo from "@/app/hooks/use-phyllo";
import Preview from "./priview";
import { useEffect, useState } from "react";
import { Project } from "@/app/type";
import { Loading, SpinLoading } from "antd-mobile";
import { success } from "@/app/utils/toast";
import useTwitterBind from "@/app/hooks/use-twitter-bind";
import { useSearchParams } from "next/navigation";
import useXShare from "@/app/hooks/use-x-share";

interface ShareListProps {
  data: Project | undefined;
  openX: (show: boolean) => void;
  openSelf: (token: Project) => void;
  code: string | null;
  shareToTwitter: () => void;
  clear: () => void;
  xUserInfo: any;
}

const isInit = true;

const Content: React.FC<ShareListProps> = ({ data, openX, openSelf, code, shareToTwitter, clear, xUserInfo }) => {
  const { isMobile } = useUserAgent();
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    console.log('xUserInfo:', xUserInfo, data);

    if (xUserInfo) {
      setPreview(true);
    }
  }, [xUserInfo]);


  return (
    <div className={isMobile ? styles.mobile : styles.pc}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Repost video on</div>
        <div className={styles.iconList}>
          <div className={styles.iconItem} onClick={() => {
            // if (!phylloAccount || phylloAccount.status === 'NOT_CONNECTED') {
            //   connectPhyllo();
            // } else {
            //   setPreview(true);
            // }
            if (!code || !xUserInfo) {
              shareToTwitter();
            } else {
              setPreview(true);
            }


            // 
          }}>
            {isInit ? (
              <>
                <div className={styles.iconWrapper + " " + styles.reward}>
                  <img src="/img/share/twitter.svg" alt="X" width={50} height={50} />
                </div>
                <span>X</span>
              </>
            ) : (
              <SpinLoading />
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Share link on</div>
        <div className={styles.iconList}>
          <div className={styles.iconItem} onClick={() => {
            if (!data) return;
            openX(true);
          }}>
            <div className={styles.iconWrapper}>
              <img src="/img/share/twitter.svg" alt="X" width={50} height={50} />
            </div>
            <span>X</span>
          </div>
          {/* <div className={styles.iconItem}>
            <div className={styles.iconWrapper}>
              <img src="/img/share/tg.svg" alt="Telegram" width={50} height={50} />
            </div>
            <span>Telegram</span>
          </div>
          <div className={styles.iconItem}>
            <div className={styles.iconWrapper}>
              <img src="/img/share/discord.svg" alt="Discord" width={50} height={50} />
            </div>
            <span>Discord</span>
          </div> */}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.iconList}>
          <div className={styles.iconItem} onClick={() => {
            if (!data) return;
            openX(true);
          }}>
            <div className={styles.iconWrapper}>
              <img src="/img/share/generate.svg" alt="Generate" width={50} height={50} />
            </div>
            <span>Generate</span>
          </div>
          <div className={styles.iconItem} onClick={() => {
            if (!data) return;
            navigator.clipboard.writeText(`${window.location.origin}/detail?detail=${data.address}`);
            success("Copy link successfully");
          }}>
            <div className={styles.iconWrapper}>
              <img src="/img/share/copy-link.svg" alt="Copy link" width={50} height={50} />
            </div>
            <span>Copy link</span>
          </div>
        </div>
      </div>

      <Preview token={data} isOpen={preview} xUserInfo={xUserInfo} onClear={() => {
        clear();
      }} onClose={() => setPreview(false)} />
    </div>
  );
};

export default Content;
