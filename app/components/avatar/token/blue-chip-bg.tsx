import { motion } from "framer-motion";

export default function BlueChipBg({ id, className }: any) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="102"
      height="102"
      viewBox="0 0 102 102"
      fill="none"
      className={className}
      animate={{
        rotateZ: 180
      }}
      transition={{
        duration: 2,
        ease: "linear",
        repeat: Infinity
      }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50.4137 49.8426L26.9452 5.31915L15.0007 13.926L49.8348 50.3053L4.5349 28.2874L0 42.294L49.6793 51.0169L0.290521 61.2598L5.25298 75.1207L49.7996 51.7531L15.5007 88.5512L27.5599 96.9967L50.4075 52.2011L43.425 102H58.1475L51.1574 52.147L74.6309 96.6801L86.5754 88.0732L51.7433 51.696L97.0405 73.7126L101.575 59.7061L51.8945 50.9829L101.284 40.7398L96.3215 26.8789L51.7718 50.2481L86.0721 13.4484L74.0129 5.00293L51.1649 49.7993L58.1475 0H43.425L50.4137 49.8426Z"
        fill={`url(#paint0_radial_9831_6751_${id})`}
      />
      <defs>
        <radialGradient
          id={`paint0_radial_9831_6751_${id}`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(50.7877 51) rotate(90) scale(51 50.7877)"
        >
          <stop stopColor="#FBCA04" />
          <stop offset="1" stopColor="#FBCA04" stopOpacity="0" />
        </radialGradient>
      </defs>
    </motion.svg>
  );
}
