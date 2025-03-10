import styles from "./timer.module.css";
import { useCountDown } from "ahooks";

export default function Timer({ time, isPreview }: any) {
  const [timeLeft, { days, hours, minutes, seconds }] = useCountDown({
    targetDate: time || 0,
    interval: 1000
  });

  if (isPreview) return <div className={styles.Container}>03:00:00</div>;

  if (!timeLeft) return null;

  return (
    <div className={styles.Container}>
      {hours} : {minutes} : {seconds}
    </div>
  );
}
