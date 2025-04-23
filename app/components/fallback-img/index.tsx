import { DetailedHTMLProps, ImgHTMLAttributes, useMemo, useState } from 'react';
import clsx from 'clsx';
import styles from './index.module.css';

const FallbackImg = (props: Props) => {
  const {
    className,
    containerClassName,
    src,
    alt,
    onLoad,
    fallback,
    ...rest
  } = props;

  const [isLoaded, setLoaded] = useState(false);

  return (
    <div
      className={clsx(styles.Container, containerClassName)}
    >
      <img
        src={src}
        alt={alt}
        className={clsx(styles.Img, !isLoaded && styles.ImgFailed, className)}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        {...rest}
      />
      {
        (!isLoaded || !src) && (
          <img
            src={fallback ?? "/img/airdrop/user-avatar.svg"}
            alt={alt}
            className={clsx(styles.Img, styles.ImgFallback, className)}
            {...rest}
          />
        )
      }
    </div>
  );
};

export default FallbackImg;

interface Props extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  fallback?: string;
  containerClassName?: string;
}
