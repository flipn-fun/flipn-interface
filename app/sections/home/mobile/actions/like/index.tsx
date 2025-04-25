import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./index.module.css";
import LikedLabel from "../liked-label";
import FloatingHearts from "./hearts";
import LikeIcon from "./like-icon";
import { useEffect, useState } from "react";
import { httpAuthPost } from "@/app/utils";
import { httpAuthDelete } from "@/app/utils";
import { useUserAgent } from "@/app/context/user-agent";
import { fail, success } from "@/app/utils/toast";
export default function Like({
  token,
  onSuccess,
  disabled,
  actionLikeTrigger,
  showShare,
  updateUserLikeNum
}: any) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [mergedLiked, setMergedLiked] = useState(false);
  const [mergedNum, setMergedNum] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useUserAgent();
  

  useEffect(() => {
    setMergedLiked(token.is_collect);
    setMergedNum(token.collect);
  }, [token]);

  return (
    <div
      className={styles.Like + ' ' + (isMobile ? styles.MbLike : styles.PcLike)}
      onClick={async (e) => {
        e.stopPropagation();
        if (disabled) return;
        if (isLoading) return;
        setIsLoading(true);

        if (!window.sexAddress) {
          window.connect();
          return;
        }

        // setShowAnimation(true);
        // setShowHearts(true);
        // setTimeout(() => {
        //   setShowAnimation(false);
        // }, 1000);

        // setTimeout(() => {
        //   setShowHearts(false);
        // }, 6000);

        const isCollect = token.is_collect;
        setMergedLiked(!isCollect);
        setMergedNum(!isCollect ? mergedNum + 1 : Math.max(mergedNum - 1, 0));

        let res
        if (isCollect) {
          res = await httpAuthDelete('/project/collect?id=' + token.id)
        } else {
          res = await httpAuthPost('/project/collect?id=' + token.id)
        }

        if (res) {
          // setMersuccess('Request Success')gedLiked(!isCollect);
          // setMergedNum(!isCollect ? mergedNum + 1 : Math.max(mergedNum - 1, 0));
          onSuccess("like");
          token.is_collect = !isCollect;
          success(isCollect ? 'Successfully canceled' : 'Successfully collected')
        } else {
          fail(isCollect ? 'Unliked' : 'Liked')
        }

        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }}
    >
      {/* {mergedLiked && <LikedLabel className={styles.LikedLabel} />}
      {showHearts && <FloatingHearts />}
      <Image
        src="/img/home/liked.gif"
        width={124}
        height={124}
        alt="Liked"
        className={styles.HeartGif}
        style={{
          left: -45,
          bottom: -30,
          opacity: showAnimation ? 1 : 0
        }}
      /> */}
      <motion.div
        initial={{ opacity: showAnimation ? 1 : 0 }}
        animate={{ opacity: showAnimation ? 0 : 1 }}
        className={`${styles.Heart} button`}
      >
        <LikeIcon isActive={mergedLiked} />
      </motion.div>
      <div className={styles.LikeNum}>{mergedNum}</div>
    </div>
  );
}
