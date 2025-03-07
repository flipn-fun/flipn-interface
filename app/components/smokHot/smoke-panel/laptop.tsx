import FlipPanel from "@/app/sections/home/laptop/panels/flip";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import type { Project } from "@/app/type";
import styles from "./laptop.module.css";
import ModalClose from "@/app/components/icons/modal-close";
import Media from '@/app/components/thumbnail/media';
import { videoReg } from '@/app/components/upload';

interface Props {
  show: boolean;
  token: Project;
  className?: any;
  isLaptopModal?: boolean;
  onSuccess: () => void;
  onHide?: () => void;
}

export default function SmokPanel({ show, token, onHide, onSuccess, className, isLaptopModal }: Props) {
  return ReactDOM.createPortal(
    <AnimatePresence mode="wait">
      {show && (
        isLaptopModal ? (
          <motion.div
            className={styles.LaptopContainer}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
          >
            <div className={styles.Title}>
              <span>
                <img className={styles.Img} src="/img/home/flipLogo.png" alt="" />
              </span>
              <button className="button" onClick={onHide}>
                <ModalClose size={34} />
              </button>
            </div>
            <div className={styles.Token}>
              <Media
                data={{
                  ...token,
                  // fix#REF-10095
                  tokenImg: videoReg.test(token.token_video || "") ? (token.token_icon || token.token_video) : token.token_video,
                }}
                imgWidth={50}
                imgHeight={50}
                autoPlay={false}
                imgStyle={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                style={{
                  overflow: "hidden",
                  width: 50,
                  borderRadius: 25,
                }}
                videoStyle={{
                  height: "100%",
                  background: "#000",
                  borderRadius: 25,
                }}
              />
              <div>
                {token.tokenSymbol}
              </div>
            </div>
            <div className={styles.Content}>
              <FlipPanel
                token={token}
                onClose={onHide}
                onSuccess={onSuccess}
                from="button"
                className={styles.SmokePanelContainer}
                inputClassName={styles.SmokePanelInputClassName}
                inputContainerClassName={styles.SmokePanelInputContainerClassName}
                isMaxLimit
                inputBoxClassName={styles.InputBoxClassName}
                valueClassName={styles.ValueClassName}
                tagsClassName={styles.TagsClassName}
                descWrapperClassName={styles.DescWrapperClassName}
                buttonClassName={styles.ButtonClassName}
                isFlipTips
                flipButtonText="Flip"
              />
            </div>
          </motion.div>
        ) : (
          <FlipPanel
            token={token}
            onClose={onHide}
            onSuccess={onSuccess}
            from="button"
            className={className}
          />
        ))}
    </AnimatePresence>,
    document.body
  );
}
