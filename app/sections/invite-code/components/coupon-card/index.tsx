import styles from "./index.module.css";
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Loading from '@/app/components/icons/loading';
import React, { useState } from 'react';
import { useUserAgent } from '@/app/context/user-agent';

const CouponCard = (props: any) => {
  const { className, children, disabled, loading, buttonText, onClick, renderButton } = props;

  const { isMobile } = useUserAgent();

  const [isStarted, setIsStarted] = useState<boolean>(false);

  const handleClick = () => {
    setIsStarted(true);
    onClick?.();
  };

  return (
    <div className={clsx(isMobile ? styles.CouponCardContainer : styles.CouponCardContainerLaptop, className)}>
      <div className={styles.CouponCardTop}>
        <div className={styles.CouponCardTopTop}>
          <img src="/img/logo.svg" alt="" className={styles.CouponCardLogo} />
        </div>
        <div className={styles.CouponCardTopMid}>
          <div className={styles.CouponCardTips}>
            Launch & trade memecoins as easy as scrolling through socials media
          </div>
          {children}
        </div>
        <div className={styles.CouponCardTopBot} />
      </div>
      <motion.div
        className={styles.CouponCardBottom}
        animate={{
          rotate: isStarted ? 5 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15
        }}
      >
        {
          typeof renderButton === "function" ? renderButton({ setIsStarted }) : (
            <button
              disabled={disabled}
              type="button"
              className={styles.CouponCardButton}
              onClick={handleClick}
            >
              {
                loading && (
                  <Loading size={16} />
                )
              }
              <div>{buttonText}</div>
            </button>
          )
        }
      </motion.div>
    </div>
  );
};

export default CouponCard;
