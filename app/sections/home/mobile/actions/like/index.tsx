import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./index.module.css";
import LikedLabel from "../liked-label";
import FloatingHearts from "./hearts";
import LikeIcon from "./like-icon";
import { useEffect, useState } from "react";
import { httpAuthPost } from "@/app/utils";
import { httpAuthDelete } from "@/app/utils";

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

  useEffect(() => {
    setMergedLiked(token.is_collect);
    setMergedNum(token.collect);
  }, [token]);

  console.log('mergedLiked:', mergedLiked)

  return (
    <div
      className={styles.Like}
      id="home-like-button"
      onClick={async () => {
        if (disabled) return;

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

        console.log('token:', token)

        let res
        if (token.is_collect) {
          res = await httpAuthDelete('/project/collect?id=' + token.id)
        } else {
          res = await httpAuthPost('/project/collect?id=' + token.id)
        }

        if (res) {
          setMergedLiked(!token.is_collect);
          setMergedNum(!token.is_collect ? mergedNum + 1 : Math.max(mergedNum - 1, 0));
          onSuccess("like");
          token.is_collect = !token.is_collect;
        }
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
