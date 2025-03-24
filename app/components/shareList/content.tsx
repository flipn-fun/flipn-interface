import { useUserAgent } from "@/app/context/user-agent";
import styles from "./index.module.css";
import usePhyllo from "@/app/hooks/use-phyllo";
import Preview from "./priview";
import { useState } from "react";
import { Project } from "@/app/type";

interface ShareListProps {
  data: Project | undefined;
}

const Content: React.FC<ShareListProps> = ({ data }) => {
  const { isMobile } = useUserAgent();
  const { token, connectPhyllo } = usePhyllo();
  const [preview, setPreview] = useState(false);

  return (
    <div className={isMobile ? styles.mobile : styles.pc}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Repost video on</div>
        <div className={styles.iconList}>
          <div className={styles.iconItem} onClick={() => {
            setPreview(true);
          }}>
            <div className={styles.iconWrapper + " " + styles.reward}>
              <img src="/img/share/twitter.svg" alt="X" width={50} height={50} />
            </div>
            <span>X</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Share link on</div>
        <div className={styles.iconList}>
          <div className={styles.iconItem}>
            <div className={styles.iconWrapper}>
              <img src="/img/share/twitter.svg" alt="X" width={50} height={50} />
            </div>
            <span>X</span>
          </div>
          <div className={styles.iconItem}>
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
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.iconList}>
          <div className={styles.iconItem}>
            <div className={styles.iconWrapper}>
              <img src="/img/share/generate.svg" alt="Generate" width={50} height={50} />
            </div>
            <span>Generate</span>
          </div>
          <div className={styles.iconItem}>
            <div className={styles.iconWrapper}>
              <img src="/img/share/copy-link.svg" alt="Copy link" width={50} height={50} />
            </div>
            <span>Copy link</span>
          </div>
        </div>
      </div>

      <Preview token={data} isOpen={preview} onClose={() => setPreview(false)} />
    </div>
  );
};

export default Content;
