import { useUserAgent } from "@/app/context/user-agent";
import styles from "./index.module.css";

interface ShareListProps {
  
}


const Content: React.FC<ShareListProps> = () => {
  const { isMobile } = useUserAgent();

  return (
    <div className={isMobile ? styles.mobile : styles.pc}>
      <div className={styles.section}>
          <div className={styles.sectionTitle}>Repost video on</div>
          <div className={styles.iconList}>
            <div className={styles.iconItem}>
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
      </div>
  );
};

export default Content;
