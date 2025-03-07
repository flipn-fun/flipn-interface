import FlipPanel from "@/app/sections/home/laptop/panels/flip";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import type { Project } from "@/app/type";
import styles from "./laptop.module.css";
import ModalClose from "@/app/components/icons/modal-close";

interface Props {
  show: boolean;
  token: Project;
  className?: any;
  inputClassName?: any;
  inputContainerClassName?: any;
  isLaptopModal?: boolean;
  onSuccess: () => void;
  onHide?: () => void;
}

export default function SmokPanel({ show, token, onHide, onSuccess, className, isLaptopModal, inputClassName, inputContainerClassName }: Props) {
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
              <span> Flip</span>
              <button className="button" onClick={onHide}>
                <ModalClose size={34} />
              </button>
            </div>
            <div className={styles.Content}>
              <FlipPanel
                token={token}
                onClose={onHide}
                onSuccess={onSuccess}
                from="button"
                className={className}
                inputClassName={inputClassName}
                inputContainerClassName={inputContainerClassName}
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
