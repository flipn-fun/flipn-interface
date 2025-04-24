'use client';

import { motion } from 'framer-motion';
import styles from './index.module.css';
import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import Popover, { PopoverPlacement } from '@/app/components/popover';
import { Order } from '@/app/sections/memes/config';
import Loading from '@/app/components/icons/loading';

const MemesSelect = (props: any) => {
  const { className, value, onChange, options, renderSelectedLabel, renderLabel, memesContainerRef, loading } = props;

  const currentValue = useMemo(() => {
    if (typeof value === "object") {
      return value;
    }
    return options?.find((item: any) => item.value === value);
  }, [value]);

  const popoverRef = useRef<any>();

  const [open, setOpen] = useState<boolean | undefined>(false);

  const handleSelect = (item: any) => {
    popoverRef.current?.onClose?.();
    onChange?.(item);
  };

  useEffect(() => {
    const onScroll = () => {
      popoverRef.current?.onClose?.();
    };

    memesContainerRef?.current?.addEventListener?.('scroll', onScroll);
    return () => {
      memesContainerRef?.current?.removeEventListener?.('scroll', onScroll);
    };
  }, []);

  return (
    <Popover
      ref={popoverRef}
      placement={PopoverPlacement.BottomRight}
      closeDelayDuration={0}
      content={(
        <div className={styles.MemesSelectDropdown}>
          {
            options?.map?.((item: any, index: number) => (
              <div
                key={index}
                className={currentValue?.value === item.value ? styles.MemesSelectDropdownItemActive : styles.MemesSelectDropdownItem}
                onClick={() => handleSelect(item)}
              >
                {
                  typeof renderLabel === 'function' ? renderLabel(item, index) : item.label
                }
              </div>
            ))
          }
        </div>
      )}
      onVisibleChange={(visible) => {
        setOpen(visible);
      }}
    >
      <button
        type="button"
        className={clsx(styles.MemesSelectContainer, className)}
        onClick={() => {
          if (open) {
            popoverRef.current?.onClose?.();
          }
        }}
      >
        <div className={styles.MemesSelectLabel}>
          {
            typeof renderSelectedLabel == 'function' ? renderSelectedLabel(currentValue) : currentValue?.label
          }
        </div>
        {
          loading ? (
            <Loading size={12} />
          ) : (
            <motion.img
              src="/img/memes/icon-arrow-down.svg"
              alt=""
              className={styles.MemesSelectArrow}
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            />
          )
        }
      </button>
    </Popover>
  );
};

export default MemesSelect;
