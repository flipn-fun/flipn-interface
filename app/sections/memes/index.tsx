"use client";

import Carousel from "@/app/sections/memes/components/carousel";
import { MemesContext } from "@/app/sections/memes/context";
import { useMemes } from "@/app/sections/memes/hooks";
import styles from "./index.module.css";
import PageHeader from "@/app/components/page-header/mobile";
import { useUserAgent } from "@/app/context/user-agent";
import { useMemo } from 'react';
import MemesContent from '@/app/sections/memes/components/content';

const MemesView = (props: any) => {
  const {} = props;

  const { isMobile } = useUserAgent();

  const data = useMemes({ isLoadData: true });

  const carouselData = useMemo(() => {
    const _hotList = data.hotList?.slice?.();
    return _hotList?.sort((a, b) => a.ranking - b.ranking)?.slice?.(0, 3) ?? [];
  }, [data.hotList]);

  return (
    <MemesContext.Provider value={{ ...data }}>
      <div ref={data.memesContainerRef} className={styles.MemesContainer}>
        {isMobile && (
          <PageHeader from="memes" style={{ position: "static" }} title="" />
        )}
        <Carousel data={carouselData} holders={data.memesListHolders} holdersLoading={data.memesListHoldersLoading} />
        <MemesContent />
      </div>
    </MemesContext.Provider>
  );
};

export default MemesView;
