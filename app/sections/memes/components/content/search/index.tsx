import styles from './index.module.css';
import { trim } from 'lodash-es';
import clsx from 'clsx';
import { useUserAgent } from '@/app/context/user-agent';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useDebounceFn } from 'ahooks';

const Search = (props: any) => {
  const { className, searchText, onChange, loading, width = 28 } = props;

  const inputRef = useRef<any>();
  const containerRef = useRef<any>();

  const { isMobile } = useUserAgent();

  const [open, setOpen] = useState(false);

  const { run: onFocus } = useDebounceFn(() => {
    inputRef.current?.focus();
  }, { wait: 300 });

  const toggleOpen = () => {
    if (!isMobile) return;
    const _open = !open;
    setOpen(_open);
    if (_open) {
      onFocus();
    }
  };

  useEffect(() => {
    if (!isMobile) {
      setOpen(true);
      return;
    }
  }, [isMobile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (isMobile && open) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobile, open]);

  return (
    <motion.div
      ref={containerRef}
      className={clsx(isMobile ? (!!trim(searchText) ? styles.MemesSearchMobileActive : styles.MemesSearchMobile) : styles.MemesSearch, className)}
      initial={isMobile ? {
        width: width,
        paddingLeft: 0,
        paddingRight: 0,
      } : void 0}
      animate={isMobile ? {
        width: open ? "100%" : width,
        paddingLeft: open ? 10 : 0,
        paddingRight: open ? 26 : 0,
      } : void 0}
    >
      <img
        src="/img/memes/icon-search.svg"
        className={styles.MemesSearchIcon}
        onClick={toggleOpen}
      />
      {
        open && (
          <>
            <input
              ref={inputRef}
              type="text"
              className={styles.MemesSearchInput}
              placeholder=""
              value={searchText}
              onChange={(e) => {
                onChange?.(e.target.value);
              }}
            />
            {
              trim(searchText) && (
                <button
                  type="button"
                  className={styles.MemesSearchClear}
                  onClick={() => {
                    if (loading) return;
                    onChange?.('');
                    if (isMobile) {
                      setOpen(false);
                    }
                  }}
                />
              )
            }
          </>
        )
      }
    </motion.div>
  );
};

export default Search;